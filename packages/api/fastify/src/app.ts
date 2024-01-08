import Fastify from "fastify";
import router from "./router";
import cors from "@fastify/cors";

const fastify = Fastify({
  // Logger only for production
  //logger: true,
});
const urls = ["http://localhost:3000"];

await fastify.register(cors, {
  origin: true,
  //methods: ["GET", "PUT", "POST", "OPTIONS"],
  // credentials: true,
});

await fastify.register(router);

export default fastify;
