import fastify from "./app";

const port = Number(process.env.FASTIFY_AI_PORT) || 3001;

await fastify.listen({ port });

console.log(`🚀  Fastify server running on port http://localhost:${port}`);
console.log(`Route index: /`);
console.log("client created successfully");
