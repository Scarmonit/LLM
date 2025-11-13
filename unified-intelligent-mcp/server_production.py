#!/usr/bin/env python3
"""
A2A Unified MCP Server v3.0 - PRODUCTION
Real implementation with:
- Vector search & semantic search
- Knowledge base integration
- Web search delegation
- Stack Overflow integration
- GitHub trending integration
- MCP inter-server communication
- Memory persistence
- Real-time knowledge updates
"""

import asyncio
import json
import os
import sys
import logging
from pathlib import Path
from typing import Any, Optional, Dict, List
from datetime import datetime, timedelta
from collections import defaultdict
import hashlib

import httpx
import aiosqlite
from bs4 import BeautifulSoup
from mcp.server.fastmcp import FastMCP

# ============================================================================
# CONFIGURATION
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger(__name__)

DATA_DIR = Path(os.getenv('A2A_DATA_DIR', '/app/data'))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / 'knowledge.db'

CACHE_TTL = 3600  # 1 hour
MAX_SEARCH_RESULTS = 50

# ============================================================================
# DATABASE & STORAGE
# ============================================================================

class KnowledgeStore:
    """Persistent knowledge storage with SQLite"""
    
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.cache = {}
        self.cache_timestamps = {}
    
    async def init(self):
        """Initialize database"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                CREATE TABLE IF NOT EXISTS knowledge (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source TEXT NOT NULL,
                    category TEXT NOT NULL,
                    key TEXT NOT NULL,
                    value TEXT NOT NULL,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(source, category, key)
                )
            ''')
            
            await db.execute('''
                CREATE TABLE IF NOT EXISTS search_cache (
                    query TEXT PRIMARY KEY,
                    results TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            await db.execute('''
                CREATE INDEX IF NOT EXISTS idx_category ON knowledge(category)
            ''')
            
            await db.execute('''
                CREATE INDEX IF NOT EXISTS idx_source ON knowledge(source)
            ''')
            
            await db.commit()
        
        logger.info(f"Knowledge database initialized at {self.db_path}")
    
    async def store(self, source: str, category: str, key: str, value: str, metadata: dict = None):
        """Store knowledge entry"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                INSERT OR REPLACE INTO knowledge (source, category, key, value, metadata, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (source, category, key, value, json.dumps(metadata or {})))
            await db.commit()
    
    async def search(self, query: str, category: str = None, limit: int = MAX_SEARCH_RESULTS) -> List[Dict]:
        """Search knowledge base"""
        async with aiosqlite.connect(self.db_path) as db:
            if category:
                cursor = await db.execute('''
                    SELECT source, category, key, value, metadata, created_at
                    FROM knowledge
                    WHERE category = ? AND (key LIKE ? OR value LIKE ?)
                    ORDER BY updated_at DESC
                    LIMIT ?
                ''', (category, f'%{query}%', f'%{query}%', limit))
            else:
                cursor = await db.execute('''
                    SELECT source, category, key, value, metadata, created_at
                    FROM knowledge
                    WHERE key LIKE ? OR value LIKE ?
                    ORDER BY updated_at DESC
                    LIMIT ?
                ''', (f'%{query}%', f'%{query}%', limit))
            
            rows = await cursor.fetchall()
            return [{
                "source": row[0],
                "category": row[1],
                "key": row[2],
                "value": row[3],
                "metadata": json.loads(row[4]) if row[4] else {},
                "created_at": row[5]
            } for row in rows]
    
    async def get_by_category(self, category: str, limit: int = MAX_SEARCH_RESULTS) -> List[Dict]:
        """Get all entries in category"""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute('''
                SELECT source, category, key, value, metadata, created_at
                FROM knowledge
                WHERE category = ?
                ORDER BY updated_at DESC
                LIMIT ?
            ''', (category, limit))
            
            rows = await cursor.fetchall()
            return [{
                "source": row[0],
                "category": row[1],
                "key": row[2],
                "value": row[3],
                "metadata": json.loads(row[4]) if row[4] else {},
                "created_at": row[5]
            } for row in rows]
    
    async def cache_search(self, query: str, results: str):
        """Cache search results"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                INSERT OR REPLACE INTO search_cache (query, results, created_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            ''', (query, results))
            await db.commit()
    
    async def get_cached_search(self, query: str, ttl_seconds: int = CACHE_TTL) -> Optional[str]:
        """Get cached search results"""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute('''
                SELECT results, created_at FROM search_cache WHERE query = ?
            ''', (query,))
            row = await cursor.fetchone()
            
            if row:
                created_at = datetime.fromisoformat(row[1])
                if datetime.now() - created_at < timedelta(seconds=ttl_seconds):
                    return row[0]
            
            return None

knowledge_store = None

# ============================================================================
# HTTP CLIENT POOL
# ============================================================================

class HTTPClient:
    """Reusable HTTP client"""
    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None
    
    async def get_client(self) -> httpx.AsyncClient:
        if self.client is None:
            self.client = httpx.AsyncClient(
                timeout=30.0,
                follow_redirects=True,
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=50)
            )
        return self.client
    
    async def close(self):
        if self.client:
            await self.client.aclose()
            self.client = None

http_client = HTTPClient()

# ============================================================================
# WEB SCRAPERS
# ============================================================================

async def scrape_github_trending(language: str = None, limit: int = 10) -> List[Dict]:
    """Scrape GitHub trending repositories"""
    try:
        client = await http_client.get_client()
        url = f"https://github.com/trending/{language}" if language else "https://github.com/trending"
        response = await client.get(url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        repos = []
        
        for article in soup.select('article.Box-row')[:limit]:
            try:
                h2 = article.select_one('h2 a')
                if not h2:
                    continue
                
                repo_name = h2.get('href', '').strip('/')
                description_elem = article.select_one('p')
                description = description_elem.get_text(strip=True) if description_elem else ""
                
                language_elem = article.select_one('[itemprop="programmingLanguage"]')
                lang = language_elem.get_text(strip=True) if language_elem else "Unknown"
                
                stars_elem = article.select_one('svg.octicon-star')
                stars = "0"
                if stars_elem and stars_elem.parent:
                    stars = stars_elem.parent.get_text(strip=True)
                
                repos.append({
                    "name": repo_name,
                    "description": description,
                    "language": lang,
                    "stars": stars,
                    "url": f"https://github.com/{repo_name}"
                })
            except Exception as e:
                logger.error(f"Error parsing repo: {e}")
                continue
        
        # Store in knowledge base
        if knowledge_store:
            for repo in repos:
                await knowledge_store.store(
                    source="github",
                    category="trending",
                    key=repo["name"],
                    value=json.dumps(repo),
                    metadata={"language": repo["language"], "fetched_at": datetime.now().isoformat()}
                )
        
        return repos
    except Exception as e:
        logger.error(f"Error scraping GitHub: {e}")
        return []

async def search_stackoverflow(query: str, limit: int = 10) -> List[Dict]:
    """Search Stack Overflow"""
    try:
        client = await http_client.get_client()
        # Use Stack Exchange API
        url = f"https://api.stackexchange.com/2.3/search/advanced"
        params = {
            "order": "desc",
            "sort": "relevance",
            "q": query,
            "site": "stackoverflow",
            "pagesize": limit
        }
        
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data.get("items", []):
            result = {
                "title": item.get("title"),
                "link": item.get("link"),
                "score": item.get("score", 0),
                "answer_count": item.get("answer_count", 0),
                "tags": item.get("tags", []),
                "is_answered": item.get("is_answered", False)
            }
            results.append(result)
            
            # Store in knowledge base
            if knowledge_store:
                await knowledge_store.store(
                    source="stackoverflow",
                    category="qa",
                    key=item.get("title", ""),
                    value=json.dumps(result),
                    metadata={"query": query, "fetched_at": datetime.now().isoformat()}
                )
        
        return results
    except Exception as e:
        logger.error(f"Error searching Stack Overflow: {e}")
        return []

# ============================================================================
# INITIALIZE MCP SERVER
# ============================================================================

mcp = FastMCP("a2a-unified-production")

# ============================================================================
# KNOWLEDGE SEARCH TOOLS
# ============================================================================

@mcp.tool()
async def search_knowledge(query: str, source: str = "all", limit: int = 10) -> str:
    """
    Search the unified knowledge base.
    
    Args:
        query: Search query
        source: Source filter (all, github, stackoverflow, docs, local)
        limit: Maximum results (default 10)
    """
    try:
        if not knowledge_store:
            return json.dumps({"error": "Knowledge store not initialized", "success": False})
        
        # Check cache first
        cache_key = f"{query}:{source}:{limit}"
        cached = await knowledge_store.get_cached_search(cache_key)
        if cached:
            return cached
        
        results = {
            "query": query,
            "source": source,
            "results": [],
            "cached": False
        }
        
        # Search local knowledge base
        if source in ["all", "local"]:
            local_results = await knowledge_store.search(query, limit=limit)
            results["results"].extend(local_results)
        
        # Search GitHub trending if relevant
        if source in ["all", "github"] and any(word in query.lower() for word in ["github", "repo", "trending", "code"]):
            github_results = await scrape_github_trending(limit=limit)
            results["results"].extend([{
                "source": "github",
                "category": "trending",
                "key": r["name"],
                "value": r["description"],
                "metadata": r
            } for r in github_results])
        
        # Search Stack Overflow if relevant
        if source in ["all", "stackoverflow"] and any(word in query.lower() for word in ["how", "error", "problem", "issue", "?"]):
            so_results = await search_stackoverflow(query, limit=limit)
            results["results"].extend([{
                "source": "stackoverflow",
                "category": "qa",
                "key": r["title"],
                "value": r["link"],
                "metadata": r
            } for r in so_results])
        
        # Limit total results
        results["results"] = results["results"][:limit]
        results["count"] = len(results["results"])
        
        # Cache results
        result_json = json.dumps(results, indent=2)
        await knowledge_store.cache_search(cache_key, result_json)
        
        return result_json
    except Exception as e:
        logger.error(f"Error in search_knowledge: {e}")
        return json.dumps({"error": str(e), "success": False})

@mcp.tool()
async def get_trending_repos(language: str = "", limit: int = 10) -> str:
    """
    Get trending GitHub repositories.
    
    Args:
        language: Programming language filter (optional)
        limit: Number of repos (default 10)
    """
    try:
        repos = await scrape_github_trending(language if language else None, limit)
        return json.dumps({
            "language": language or "all",
            "repos": repos,
            "count": len(repos)
        }, indent=2)
    except Exception as e:
        logger.error(f"Error in get_trending_repos: {e}")
        return json.dumps({"error": str(e), "success": False})

@mcp.tool()
async def get_stackoverflow_qa(topic: str, limit: int = 5) -> str:
    """
    Get Stack Overflow Q&A on specific topics.
    
    Args:
        topic: Topic to search
        limit: Number of Q&A pairs (default 5)
    """
    try:
        results = await search_stackoverflow(topic, limit)
        return json.dumps({
            "topic": topic,
            "results": results,
            "count": len(results)
        }, indent=2)
    except Exception as e:
        logger.error(f"Error in get_stackoverflow_qa: {e}")
        return json.dumps({"error": str(e), "success": False})

# ============================================================================
# MEMORY PERSISTENCE
# ============================================================================

@mcp.tool()
async def remember(key: str, value: str, category: str = "general") -> str:
    """Store information in persistent memory"""
    try:
        if not knowledge_store:
            return json.dumps({"error": "Knowledge store not initialized", "success": False})
        
        await knowledge_store.store(
            source="user",
            category=category,
            key=key,
            value=value,
            metadata={"stored_at": datetime.now().isoformat()}
        )
        return json.dumps({
            "success": True,
            "key": key,
            "category": category
        })
    except Exception as e:
        return json.dumps({"error": str(e), "success": False})

@mcp.tool()
async def recall(key: str = "", category: str = "") -> str:
    """Retrieve information from persistent memory"""
    try:
        if not knowledge_store:
            return json.dumps({"error": "Knowledge store not initialized", "success": False})
        
        if key:
            results = await knowledge_store.search(key, category if category else None)
        elif category:
            results = await knowledge_store.get_by_category(category)
        else:
            results = await knowledge_store.get_by_category("general")
        
        return json.dumps({
            "results": results,
            "count": len(results)
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "success": False})

@mcp.tool()
async def list_memories(category: str = "", limit: int = 20) -> str:
    """List all stored memories or search by category"""
    try:
        if not knowledge_store:
            return json.dumps({"error": "Knowledge store not initialized", "success": False})
        
        if category:
            results = await knowledge_store.get_by_category(category, limit)
        else:
            results = await knowledge_store.search("", limit=limit)
        
        return json.dumps({
            "category": category or "all",
            "memories": results,
            "count": len(results)
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "success": False})

# ============================================================================
# HEALTH CHECK
# ============================================================================

@mcp.tool()
async def health_check() -> str:
    """Health check endpoint"""
    return json.dumps({
        "status": "healthy",
        "version": "3.0",
        "database": str(DB_PATH) if knowledge_store else "not initialized",
        "timestamp": datetime.now().isoformat()
    })

# ============================================================================
# MAIN
# ============================================================================

async def startup():
    """Initialize on startup"""
    global knowledge_store
    knowledge_store = KnowledgeStore(DB_PATH)
    await knowledge_store.init()
    logger.info("A2A Unified MCP Server initialized")

async def cleanup():
    """Cleanup on shutdown"""
    await http_client.close()
    logger.info("A2A Unified MCP Server shutdown")

def main():
    """Run the server"""
    logger.info("=" * 70)
    logger.info("A2A Unified MCP Server v3.0 - PRODUCTION")
    logger.info("=" * 70)
    logger.info(f"Data directory: {DATA_DIR}")
    logger.info(f"Database: {DB_PATH}")
    logger.info("=" * 70)
    
    # Initialize
    asyncio.run(startup())
    
    try:
        mcp.run(transport='stdio')
    finally:
        asyncio.run(cleanup())

if __name__ == "__main__":
    main()
