import Fastify from "fastify";
import router from "./router";

const fastify = Fastify({
  // Logger only for production
  logger: true,
});

fastify.register(router);

export default fastify;
