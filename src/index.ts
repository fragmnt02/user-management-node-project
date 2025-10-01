import "./config/env";
import { createServer } from "http";
import app from "./app";

const HOST: string = process.argv[2] || process.env.HOST || "localhost";
const PORT: number = Number(process.argv[3] || process.env.PORT || 8080);

createServer(app).listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://${HOST}:${PORT}`);
});
