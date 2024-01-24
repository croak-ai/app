import fastify from "./app";

const port = Number(process.env.FASTIFY_AI_PORT) || 3001;

fastify.listen({ port }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`🚀  Fastify server running on ${address}`);
});
