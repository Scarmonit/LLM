# Build Full Stack

Complete end-to-end full stack application development with **AUTOMATED CODE GENERATION** - from zero to deployed in one command.

**Usage:** `/build-full-stack <project description>`

**What it does:**
Analyzes requirements, designs architecture, **generates ALL code files**, creates tests, sets up CI/CD, and deploys to production. No manual coding required.

**Example:**
```bash
/build-full-stack E-commerce platform with user auth, product catalog, shopping cart, and Stripe payments
/build-full-stack analyze existing    # Analyze existing project and generate missing pieces
```

---

# Executing for: {{arg:project}}

---

## Phase 0: Project Type Detection

**Step 1: Detect if Existing or New Project**

```bash
# Check for existing project indicators
- package.json (Node.js)
- requirements.txt / pyproject.toml (Python)
- go.mod (Go)
- Cargo.toml (Rust)
- composer.json (PHP)
- .env file (indicates configuration exists)
```

**If EXISTING project detected:**
1. Read .env for configured services
2. Scan codebase for implemented vs missing features
3. Use Grep to find TODO, FIXME, NotImplemented
4. Generate gap analysis table
5. Ask user: "Generate missing pieces or start fresh?"

**If NEW project:**
1. Continue to requirements analysis
2. Create full project from scratch

---

## Phase 1: Requirements Deep Dive

Use `mcp__sequential-thinking` for comprehensive analysis:

**1.1 Core Features**
- List all user-facing features
- Define CRUD operations for each entity
- Identify real-time requirements (WebSocket, SSE)
- Third-party integrations (payments, email, SMS)

**1.2 User Roles & Permissions**
```
Admin: Full access
Manager: Create, Read, Update (no delete)
User: Read own data, Update own profile
Guest: Read public data only
```

**1.3 Data Entities & Relationships**
```
User (1) -----> (N) Orders
Order (1) -----> (N) OrderItems
Product (1) <----- (N) OrderItems
User (N) <-----> (N) Products (favorites/cart)
```

**1.4 Scale Requirements**
- Concurrent users: [estimated]
- Data volume: [estimated records]
- Traffic patterns: [peak vs average]
- Geographic distribution: [single region vs multi-region]

**1.5 Non-Functional Requirements**
- Response time: <200ms for API calls
- Uptime: 99.9% SLA
- Security: OWASP Top 10 compliance
- Compliance: GDPR, SOC2, HIPAA (if applicable)

Store in knowledge graph:
```javascript
mcp__memory__create_entities({
  entities: [{
    name: "ProjectRequirements-{{arg:project}}",
    entityType: "requirements",
    observations: [/* all above analysis */]
  }]
})
```

---

## Phase 2: Technology Stack Decision (Evidence-Based)

**For each technology choice, use WebSearch for latest 2025 data:**

**2.1 Frontend Framework**
```bash
WebSearch: "React vs Vue vs Svelte 2025 performance comparison"
WebSearch: "[use case] best frontend framework 2025"
```

Decision factors:
- Team expertise
- Ecosystem maturity
- Performance (bundle size, TTI)
- TypeScript support
- Server components (if needed)

**2.2 Backend Framework**
```bash
WebSearch: "Node.js vs Python vs Go backend 2025"
WebSearch: "best backend for [scale] users 2025"
```

Decision factors:
- Performance (requests/sec)
- Real-time support
- Ecosystem (packages available)
- Deployment ease
- Cost (serverless vs VPS)

**2.3 Database**
```bash
WebSearch: "PostgreSQL vs MongoDB vs MySQL 2025 when to use"
WebSearch: "[use case] database choice 2025"
```

Decision matrix:
- SQL: Complex relationships, ACID transactions, reporting
- NoSQL: Document flexibility, horizontal scaling, high writes
- Time-series: IoT, metrics, logging
- Graph: Social networks, recommendations

**2.4 Infrastructure**
```bash
WebSearch: "Serverless vs containers 2025 cost comparison"
WebSearch: "AWS vs Vercel vs Render 2025 best for [use case]"
```

Store decisions:
```javascript
mcp__memory__create_entities({
  entities: [{
    name: "TechStack-{{arg:project}}",
    entityType: "tech_stack",
    observations: [
      "Frontend: React 19 (reason: Server components, best ecosystem)",
      "Backend: Node.js 22 with Express (reason: Fast, mature, same language)",
      "Database: PostgreSQL 16 (reason: ACID, complex queries, JSON support)",
      "Cache: Redis 7 (reason: Speed, sessions, queues)",
      "Deploy: Docker + Railway (reason: Easy, cheap, scales)"
    ]
  }]
})
```

---

## Phase 3: Architecture Design

**3.1 System Architecture**
Generate complete system design:

```
┌─────────────────┐
│   React SPA     │
│   (Port 3000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────┐
│  Express API    │─────▶│  Redis   │
│  (Port 3001)    │      │  Cache   │
└────────┬────────┘      └──────────┘
         │
         ▼
┌─────────────────┐      ┌──────────┐
│   PostgreSQL    │      │  S3/CDN  │
│   (Port 5432)   │      │  Assets  │
└─────────────────┘      └──────────┘
```

**3.2 API Design Pattern**
Choose: REST vs GraphQL vs tRPC

For REST (most common):
```
GET    /api/v1/users          # List users
POST   /api/v1/users          # Create user
GET    /api/v1/users/:id      # Get user
PUT    /api/v1/users/:id      # Update user
DELETE /api/v1/users/:id      # Delete user
```

**3.3 Authentication Flow**
```
1. POST /auth/register → JWT token
2. POST /auth/login → JWT + refresh token
3. Use JWT in Authorization: Bearer <token>
4. POST /auth/refresh → New JWT
5. POST /auth/logout → Invalidate tokens
```

**3.4 Error Handling Strategy**
```javascript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "status": 400,
    "details": { "field": "email", "rule": "required" }
  }
}
```

---

## Phase 4: Database Schema Design

**4.1 Generate Complete Schema**

```sql
-- migrations/001_initial_schema.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (if not using JWT-only)
CREATE TABLE sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add entity-specific tables based on requirements
-- [GENERATED BASED ON PHASE 1 ENTITIES]

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_expire ON sessions(expire);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**4.2 Generate Down Migration**
```sql
-- migrations/down/001_initial_schema.sql
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
```

**4.3 Seed Data**
```javascript
// seeds/001_admin_user.js
const bcrypt = require('bcrypt');

module.exports = async (db) => {
  const hash = await bcrypt.hash('admin123', 10);

  await db.query(`
    INSERT INTO users (email, password_hash, role, email_verified)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO NOTHING
  `, ['admin@example.com', hash, 'admin', true]);

  console.log('✅ Admin user created (admin@example.com / admin123)');
};
```

---

## Phase 5: Security Implementation

**5.1 OWASP Top 10 Checklist**
```javascript
// ✅ A01: Broken Access Control
- Implement role-based access control (RBAC)
- Validate user owns resource before allowing access
- Use middleware: requireAuth, requireRole('admin')

// ✅ A02: Cryptographic Failures
- Use bcrypt (cost 12) for passwords
- Use AES-256-GCM for data encryption
- TLS 1.3 for all connections
- Secure cookie flags: httpOnly, secure, sameSite

// ✅ A03: Injection
- Use parameterized queries (ALWAYS)
- Validate/sanitize all inputs
- Use ORM with escape functions

// ✅ A04: Insecure Design
- Implement rate limiting (express-rate-limit)
- Add CAPTCHA for auth endpoints
- Use CSRF tokens for state-changing operations

// ✅ A05: Security Misconfiguration
- Helmet.js for security headers
- Disable X-Powered-By header
- Set strict Content-Security-Policy

// ✅ A06: Vulnerable Components
- npm audit fix --force
- Dependabot alerts enabled
- Auto-update non-breaking patches

// ✅ A07: Authentication Failures
- JWT with short expiry (15min)
- Refresh tokens (7 days)
- Account lockout after 5 failed attempts
- Password requirements: 12+ chars, complexity

// ✅ A08: Data Integrity Failures
- Sign JWTs with strong secret (256-bit)
- Verify data checksums for uploads
- Validate API responses from third parties

// ✅ A09: Logging Failures
- Log all auth events
- Log API errors with context
- Never log passwords/tokens
- Send critical errors to monitoring (Sentry)

// ✅ A10: Server-Side Request Forgery
- Validate/whitelist external URLs
- Use separate network for backend services
- Disable unnecessary protocols
```

**5.2 Generate Security Middleware**

```javascript
// middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

module.exports = (app) => {
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later'
  });
  app.use('/api/', limiter);

  // Auth rate limiting (stricter)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Data sanitization
  app.use(mongoSanitize()); // Prevent NoSQL injection
  app.use(hpp()); // Prevent HTTP parameter pollution

  // Disable X-Powered-By
  app.disable('x-powered-by');
};
```

---

## Phase 10: AUTOMATED CODE GENERATION

**THIS IS WHERE THE MAGIC HAPPENS - Generate ALL project files automatically**

### 10.1 Project Structure Generation

```bash
project-name/
├── .github/
│   └── workflows/
│       ├── test.yml          # ✅ Auto-generated
│       └── deploy.yml        # ✅ Auto-generated
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js   # ✅ Auto-generated
│   │   │   └── redis.js      # ✅ Auto-generated
│   │   ├── middleware/
│   │   │   ├── auth.js       # ✅ Auto-generated
│   │   │   ├── validation.js # ✅ Auto-generated
│   │   │   ├── error.js      # ✅ Auto-generated
│   │   │   └── security.js   # ✅ Auto-generated
│   │   ├── routes/
│   │   │   ├── auth.js       # ✅ Auto-generated
│   │   │   └── [entities].js # ✅ Auto-generated per entity
│   │   ├── models/
│   │   │   └── [entities].js # ✅ Auto-generated per entity
│   │   ├── services/
│   │   │   └── [entities].js # ✅ Auto-generated per entity
│   │   ├── utils/
│   │   │   ├── logger.js     # ✅ Auto-generated
│   │   │   └── asyncHandler.js # ✅ Auto-generated
│   │   └── server.js         # ✅ Auto-generated
│   ├── migrations/
│   │   ├── up/               # ✅ Auto-generated
│   │   └── down/             # ✅ Auto-generated
│   ├── seeds/                # ✅ Auto-generated
│   ├── tests/
│   │   ├── unit/             # ✅ Auto-generated
│   │   └── integration/      # ✅ Auto-generated
│   ├── .env.example          # ✅ Auto-generated
│   ├── Dockerfile            # ✅ Auto-generated
│   └── package.json          # ✅ Auto-generated
├── frontend/
│   ├── src/
│   │   ├── components/       # ✅ Auto-generated
│   │   ├── pages/            # ✅ Auto-generated
│   │   ├── hooks/            # ✅ Auto-generated
│   │   ├── services/         # ✅ Auto-generated (API clients)
│   │   ├── context/          # ✅ Auto-generated (Auth, Theme)
│   │   └── App.jsx           # ✅ Auto-generated
│   ├── Dockerfile            # ✅ Auto-generated
│   └── package.json          # ✅ Auto-generated
├── docker-compose.yml        # ✅ Auto-generated
├── docker-compose.prod.yml   # ✅ Auto-generated
└── README.md                 # ✅ Auto-generated

✅ TOTAL: 50-100+ files generated automatically
```

### 10.2 Backend Code Generation

**Server Entry Point**
```javascript
// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const setupSecurity = require('./middleware/security');
const errorHandler = require('./middleware/error');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/auth');
// [IMPORT ALL ENTITY ROUTES]

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) }}));

// Security
setupSecurity(app);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
// [USE ALL ENTITY ROUTES]

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function start() {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
```

**Auth Routes (Complete Implementation)**
```javascript
// backend/src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 12 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
];

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Check if user exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
    [email, passwordHash]
  );

  const user = result.rows[0];
  const tokens = generateTokens(user.id);

  logger.info(`User registered: ${email}`);

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    ...tokens
  });
}));

// POST /api/auth/login
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user
  const result = await pool.query(
    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const tokens = generateTokens(user.id);

  logger.info(`User logged in: ${email}`);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    ...tokens
  });
}));

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = generateTokens(decoded.userId);
    res.json(tokens);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}));

module.exports = router;
```

**Auth Middleware**
```javascript
// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/database');

const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { requireAuth, requireRole };
```

### 10.3 Frontend Code Generation

**React App Entry**
```jsx
// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
// [IMPORT ALL ENTITY PAGES]

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* [ADD ALL ENTITY ROUTES] */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

**Auth Context**
```jsx
// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and load user
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    setUser(user);
    return user;
  };

  const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    const { user, accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**API Service with Auto-Retry**
```javascript
// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 10.4 Testing Code Generation

**Unit Tests**
```javascript
// backend/tests/unit/auth.test.js
const request = require('supertest');
const app = require('../../src/server');
const { pool } = require('../../src/config/database');

describe('Auth API', () => {
  beforeEach(async () => {
    // Clear users table
    await pool.query('DELETE FROM users');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject duplicate emails', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
    });
  });
});
```

### 10.5 Docker Configuration

**Backend Dockerfile**
```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "src/server.js"]
```

**Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:3001/api
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## Phase 11: Database Migrations System

**Migration Runner**
```javascript
// backend/migrations/migrate.js
const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../src/config/database');

// Create migrations table
async function initMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

// Get executed migrations
async function getExecutedMigrations() {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

// Run migrations
async function migrate() {
  await initMigrationsTable();

  const executed = await getExecutedMigrations();
  const migrationsDir = path.join(__dirname, 'up');
  const files = await fs.readdir(migrationsDir);
  const pending = files.filter(f => !executed.includes(f)).sort();

  if (pending.length === 0) {
    console.log('✅ No pending migrations');
    return;
  }

  console.log(`Running ${pending.length} migrations...`);

  for (const file of pending) {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');

    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      await pool.query('COMMIT');
      console.log(`✅ ${file}`);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(`❌ ${file}: ${error.message}`);
      throw error;
    }
  }

  console.log('🎉 All migrations completed');
}

// Rollback last migration
async function rollback() {
  await initMigrationsTable();

  const result = await pool.query(
    'SELECT name FROM migrations ORDER BY id DESC LIMIT 1'
  );

  if (result.rows.length === 0) {
    console.log('No migrations to rollback');
    return;
  }

  const lastMigration = result.rows[0].name;
  const downFile = path.join(__dirname, 'down', lastMigration);

  const sql = await fs.readFile(downFile, 'utf8');

  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query('DELETE FROM migrations WHERE name = $1', [lastMigration]);
    await pool.query('COMMIT');
    console.log(`✅ Rolled back ${lastMigration}`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`❌ Rollback failed: ${error.message}`);
    throw error;
  }
}

// CLI
const command = process.argv[2];

if (command === 'up') {
  migrate().then(() => process.exit(0)).catch(() => process.exit(1));
} else if (command === 'down') {
  rollback().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  console.log('Usage: node migrate.js [up|down]');
  process.exit(1);
}
```

---

## Phase 12: CI/CD Pipeline

**GitHub Actions - Test & Deploy**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Run migrations
        working-directory: backend
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
        run: node migrations/migrate.js up

      - name: Run tests
        working-directory: backend
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret
        run: npm test

      - name: Run security audit
        working-directory: backend
        run: npm audit --audit-level=moderate

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ github.repository }}/backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ghcr.io/${{ github.repository }}/frontend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

      - name: Health check
        run: |
          sleep 30
          curl -f ${{ secrets.DEPLOY_URL }}/health || exit 1

      - name: Notify success
        if: success()
        run: echo "🎉 Deployment successful!"

      - name: Notify failure
        if: failure()
        run: echo "❌ Deployment failed!"
```

---

## Phase 13: Actual Deployment

**Steps to deploy:**

1. **Initialize Git**
```bash
git init
git add .
git commit -m "Initial commit - Auto-generated full stack app"
```

2. **Create GitHub Repository**
```bash
gh repo create [project-name] --public --source=. --push
```

3. **Choose Deployment Platform**

**Option A: Railway (Recommended - Easy)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis

# Deploy
railway up
```

**Option B: Render**
```yaml
# render.yaml
services:
  - type: web
    name: backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: postgres
          property: connectionString
      - key: REDIS_URL
        fromDatabase:
          name: redis
          property: connectionString

  - type: web
    name: frontend
    env: static
    buildCommand: npm run build
    staticPublishPath: ./frontend/dist

databases:
  - name: postgres
    databaseName: myapp
    user: myapp

  - name: redis
```

**Option C: Docker + VPS (Digital Ocean, Linode)**
```bash
# SSH to server
ssh user@server

# Clone repo
git clone [repo-url]
cd [project-name]

# Setup .env
cp .env.example .env
nano .env

# Deploy with Docker Compose
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose exec backend node migrations/migrate.js up
```

4. **Verify Deployment**
```bash
# Health check
curl https://your-app.railway.app/health

# Test login
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

5. **Setup Custom Domain (Optional)**
```bash
# Railway
railway domain

# Render
# Go to Settings → Custom Domain
```

---

## Phase 14: Testing Strategy

**Test Coverage Goals:**
- Unit tests: 80%+ coverage
- Integration tests: All API endpoints
- E2E tests: Critical user flows
- Performance: <200ms API response

**Load Testing (k6)**
```javascript
// tests/load/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
};

export default function () {
  let response = http.get('https://your-app.com/api/users');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

Run: `k6 run tests/load/api-load-test.js`

---

## Phase 15: Knowledge Graph Storage

```javascript
// Store complete project
mcp__memory__create_entities({
  entities: [{
    name: "DeployedApp-{{arg:project}}",
    entityType: "deployed_application",
    observations: [
      "Project: {{arg:project}}",
      "Tech stack: React 19 + Node.js 22 + PostgreSQL 16 + Redis 7",
      "GitHub: [generated-repo-url]",
      "Deployed: [railway-url or render-url]",
      "Status: LIVE ✅",
      "Files generated: 87",
      "Tests passing: ✅",
      "Health check: ✅",
      "Completion date: [timestamp]"
    ]
  }]
});
```

---

## ✅ FINAL OUTPUT

```
🎉 FULL STACK APPLICATION DEPLOYED!
====================================

📊 Project Stats
├─ Files Generated: 87
├─ Lines of Code: ~5,000
├─ Tests: 45 (all passing)
├─ API Endpoints: 12
├─ React Components: 18
└─ Time to Deploy: ~15 minutes

🔗 Links
├─ GitHub: https://github.com/[user]/[repo]
├─ Live App: https://[app].railway.app
├─ API Docs: https://[app].railway.app/api-docs
└─ Health Check: https://[app].railway.app/health ✅

🔐 Default Credentials
Email: admin@example.com
Password: admin123
⚠️  CHANGE IMMEDIATELY IN PRODUCTION!

📚 What Was Generated
Backend (Node.js + Express):
  ✅ Authentication system (JWT + refresh tokens)
  ✅ User management API
  ✅ PostgreSQL database with migrations
  ✅ Redis caching layer
  ✅ Input validation & sanitization
  ✅ Security middleware (Helmet, rate limiting)
  ✅ Error handling
  ✅ Logging (Winston)
  ✅ Unit & integration tests
  ✅ Docker configuration

Frontend (React 19):
  ✅ Authentication pages (login/register)
  ✅ Dashboard
  ✅ Protected routes
  ✅ Auth context & hooks
  ✅ API service with auto-retry
  ✅ Form validation
  ✅ Error handling
  ✅ Responsive design

DevOps:
  ✅ GitHub Actions CI/CD
  ✅ Docker multi-stage builds
  ✅ Database migrations
  ✅ Health checks
  ✅ Environment configs
  ✅ Deployment to Railway/Render

📖 Next Steps
1. Change default admin password
2. Add your business logic
3. Customize UI/branding
4. Setup monitoring (Sentry, LogRocket)
5. Configure custom domain
6. Enable HTTPS (automatic on Railway/Render)
7. Scale as needed

🆘 Support
- Docs: ./README.md
- API Docs: /api-docs
- GitHub Issues: [repo]/issues

🎊 Your app is LIVE and ready to use!
```

---

## Execution Rules

1. **Ask before generating** if user wants all files or selective generation
2. **Use TodoWrite** to track each file generation
3. **Test locally** before deploying
4. **Verify deployment** with health checks
5. **Store in knowledge graph** for future reference
6. **Always generate production-ready code** (no TODOs, no placeholders)
7. **Security first** - all OWASP Top 10 addressed
8. **Full test coverage** - every endpoint tested
9. **Real deployment** - not just code, but live URL
10. **Documentation** - comprehensive README and API docs

**This workflow generates a complete, production-ready, deployed application automatically.**
