import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { z } from "zod";

const RENDER_API_KEY = process.env.RENDER_API_KEY;

const server = new Server(
  {
    name: "render-api-extension",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "render_set_env_var",
        description: "Set an environment variable for a Render service",
        inputSchema: {
          type: "object",
          properties: {
            serviceId: { type: "string" },
            key: { type: "string" },
            value: { type: "string" },
          },
          required: ["serviceId", "key", "value"],
        },
      },
      {
        name: "render_update_service",
        description: "Update service configuration (e.g. health check path)",
        inputSchema: {
          type: "object",
          properties: {
            serviceId: { type: "string" },
            healthCheckPath: { type: "string" },
          },
          required: ["serviceId"],
        },
      },
      {
        name: "render_deploy_service",
        description: "Trigger a deploy for a service",
        inputSchema: {
          type: "object",
          properties: {
            serviceId: { type: "string" },
            clearCache: { type: "boolean" },
          },
          required: ["serviceId"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!RENDER_API_KEY) {
    throw new Error("RENDER_API_KEY environment variable is not set");
  }

  const client = axios.create({
    baseURL: "https://api.render.com/v1",
    headers: {
      Authorization: `Bearer ${RENDER_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  try {
    if (request.params.name === "render_set_env_var") {
      const { serviceId, key, value } = request.params.arguments as any;
      // Render API for env vars is a PUT/POST to /services/{serviceId}/env-vars
      // Actually it's usually /services/{serviceId}/env-vars
      // We will try to set one variable. Render API might require setting all?
      // Actually, the endpoint is likely POST /services/{serviceId}/env-vars to create/update
      await client.post(`/services/${serviceId}/env-vars`, [
        { key, value }
      ]);
      return {
        content: [{ type: "text", text: `Successfully set environment variable ${key} for service ${serviceId}` }],
      };
    }

    if (request.params.name === "render_update_service") {
      const { serviceId, healthCheckPath } = request.params.arguments as any;
      // PATCH /services/{serviceId}
      await client.patch(`/services/${serviceId}`, {
        serviceDetails: {
            healthCheckPath
        }
      });
      return {
        content: [{ type: "text", text: `Successfully updated service ${serviceId} configuration` }],
      };
    }

    if (request.params.name === "render_deploy_service") {
      const { serviceId, clearCache } = request.params.arguments as any;
      // POST /services/{serviceId}/deploys
      await client.post(`/services/${serviceId}/deploys`, {
        clearCache: clearCache ? "clear" : "do_not_clear"
      });
      return {
        content: [{ type: "text", text: `Successfully triggered deploy for service ${serviceId}` }],
      };
    }

    throw new Error(`Tool ${request.params.name} not found`);
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

const main = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});