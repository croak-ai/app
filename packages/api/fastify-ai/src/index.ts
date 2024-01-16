import fastify from "./app";

const port = Number(process.env.FASTIFY_PORT) || 3001;

await fastify.listen({ port });

console.log(`🚀  Fastify server running on port http://localhost:3001`);
console.log(`Route index: /`);
console.log("client created successfully");
