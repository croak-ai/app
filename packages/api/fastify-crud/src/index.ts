import fastify from "./app";

const port = Number(process.env.FASTIFY_CRUD_PORT) || 3002;

await fastify.listen({ port });

console.log(`🚀  Fastify server running on http://localhost:${port}`);
console.log(`Route index: /`);
console.log("client created successfully");
