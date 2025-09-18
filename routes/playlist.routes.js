import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {createPlaylist,addVideoToPlaylist,deletePlaylist,getPlaylistById} from "../controllers/playlist.controller.js"

const  router = Router();

router.post("/create",verifyJwt,createPlaylist)
router.post("/:playlistId/videos/:videoId",verifyJwt,addVideoToPlaylist)
router.delete("/delete/:playlistId",verifyJwt,deletePlaylist)
router.get("/getplaylist/:playlistId",verifyJwt,getPlaylistById)

export  default router