import express, {
  type NextFunction,
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
// import mainRouter from "./controllers/index";

dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health check route
app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({ message: "Outfits server is running 🚀" });
});

// app.use("/api", mainRouter);
// app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ Error: err.message });
});

export default app;
