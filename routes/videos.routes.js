import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/mluter.middleware.js";

import {uploadVideo,updateVideo,deleteVideo,getAllVideos,togglePublishStatus} from "../controllers/video.controller.js"

const router = Router();

const uploadMiddleware = upload.fields([
    {name:"coverImage",maxCount:1},
    {name:"thumbnail",maxCount:1},
    {name:"video",maxCount:1}
])
router.post("/uploadVideo",verifyJwt,uploadMiddleware,uploadVideo)
router.patch("/updatevideo/:id",verifyJwt,upload.single("thumbnail"),updateVideo)
router.patch("/deletevideo/:id",verifyJwt,deleteVideo)
router.get("/getallvideos",verifyJwt,getAllVideos)
router.patch("/PublishStatus/:id",verifyJwt,togglePublishStatus)




export default router