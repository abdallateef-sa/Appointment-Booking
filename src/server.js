import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import indexRoute from "./routes/indexRoute.js";
import globalError from "./middlewares/errorMiddleware.js";
import ApiError from "./utils/appError.js";

dotenv.config();
connectDB();

const app = express();

// Morgan logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use(cors());
app.use(express.json());

//Mount Route
app.use("/api/v1", indexRoute);

// Global Error Handler
app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log("server run on port", PORT);
});

// handel rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("shutting down...");
    process.exit(1);
  });
});
