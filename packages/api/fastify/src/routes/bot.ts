import app from "../index";
import { Request, Response } from "express";

app.get("/express/test", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});
