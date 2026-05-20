import express from "express";
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./lib/db.js";
import { connectRedis } from "./lib/redis.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use( express.json() );
app.use( "/api/auth", authRoutes );

app.listen( PORT, async () => {
  console.log( `Server is running on http://localhost:${ PORT }` );
  connectDB();

  try {
    await connectRedis();
  } catch ( err ) {
    console.error( "Redis startup failed. The app will continue without Redis.", err );
  }
} );