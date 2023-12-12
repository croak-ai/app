import app from "../../index";
import { Request, Response } from "express";

app.get("/test", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});
