/**
 * Cloudflare Worker for LM Studio LFM2 Agent
 *
 * Edge deployment of LFM2 agent with TypeScript integration.
 * Provides REST API for agent execution with CORS support.
 */

interface Env {
  LM_STUDIO_API_URL: string;
  AGENT_AUTH_TOKEN: string;
  AGENT_CACHE: KVNamespace;
}

interface AgentRequest {
  instruction: string;
  tools?: string[];
  model?: string;
}

interface AgentResponse {
  success: boolean;
  result?: any;
  error?: string;
  cached?: boolean;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // CORS headers for browser access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({ status: 'healthy', timestamp: Date.now() }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Agent execution endpoint
    if (url.pathname === '/execute' && request.method === 'POST') {
      try {
        const body: AgentRequest = await request.json();

        if (!body.instruction) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing instruction' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Check cache for recent identical requests
        const cacheKey = `agent:${JSON.stringify(body)}`;
        const cached = await env.AGENT_CACHE.get(cacheKey);

        if (cached) {
          return new Response(
            JSON.stringify({ success: true, result: JSON.parse(cached), cached: true }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Call LM Studio API
        const response = await fetch(env.LM_STUDIO_API_URL + '/agent/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.AGENT_AUTH_TOKEN}`,
          },
          body: JSON.stringify({
            model: body.model || 'lmstudio-community/LFM2-350M-Instruct-GGUF',
            instruction: body.instruction,
            tools: body.tools || [],
          }),
        });

        if (!response.ok) {
          throw new Error(`LM Studio API error: ${response.status}`);
        }

        const result = await response.json();

        // Cache successful results for 5 minutes
        ctx.waitUntil(
          env.AGENT_CACHE.put(cacheKey, JSON.stringify(result), {
            expirationTtl: 300,
          })
        );

        return new Response(
          JSON.stringify({ success: true, result }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 404 for unknown routes
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    });
  },
};
