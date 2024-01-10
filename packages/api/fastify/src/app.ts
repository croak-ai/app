/* Initalize Fastify and register CORS/router */
import Fastify from "fastify";
import router from "./router";
import cors from "@fastify/cors";

const fastify = Fastify();

const nextDomain = process.env.NEXT_APP_DOMAIN || "http://localhost:3000";
const urls = [nextDomain];

await fastify.register(cors, {
  origin: urls,
  credentials: true,
});

await fastify.register(router);

export default fastify;
