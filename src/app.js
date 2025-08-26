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
app.use()
