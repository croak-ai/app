import app from "./app";

//const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3006;

app.listen({ port: 3000 });

console.log(`🚀  Fastify server running on port http://localhost:3000`);
console.log(`Route index: /`);
console.log(`Route user: /api/v1/user`);
