import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors(
    {origin:process.env.CORS_ORIGIN,credentials:true}
));
app.use(express.json());
app.use(cookieParser());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));




//routes
import userRouter from "./routes/user.routes.js"
import uploadVideo from "./routes/videos.routes.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v2/videos",uploadVideo)


export default app;