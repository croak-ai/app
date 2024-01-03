import z from "zod";

export const zChannelTypes = z.enum(["text", "voice"]);
