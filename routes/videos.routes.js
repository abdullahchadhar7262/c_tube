import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/mluter.middleware.js";

import {uploadVideo} from "../controllers/video.controller.js"

const router = Router();

const uploadMiddleware = upload.fields([
    {name:"coverImage",maxCount:1},
    {name:"thumbnail",maxCount:1},
    {name:"video",maxCount:10}
])
router.post("/uploadVideo",verifyJwt,uploadMiddleware,uploadVideo)



export default router