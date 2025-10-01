import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import usersRouter from "./routes/users.routes";
import { notFound, errorHandler } from "./middlewares/error";
import "./config/env";

const app = express();

// Security + performance
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120, // 120 req/min per IP
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.use(cors());

// Logging
app.use(morgan("dev"));

// Health
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Routes
app.use("/api/users", usersRouter);

// 404 + error
app.use(notFound);
app.use(errorHandler);

export default app;
