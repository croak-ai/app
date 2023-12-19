import server from "./app";

//const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3006;

server.listen({ port: 3001 });

console.log(`🚀  Fastify server running on port http://localhost:3000`);
console.log(`Route index: /`);
console.log(`Route user: /api/v1/user`);
console.log("client created successfully");
