import playlistModel from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import apiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiRespose.js";
import asynchandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const createPlaylist = asynchandler(async (req, res) => {
  const { name, description, privacy } = req.body;

  // Validate required fields
  if (!name || !description) {
    throw new apiError(400, "Name and description are required");
  }

  // Create playlist
  const playlist = await playlistModel.create({
    name,
    description,
    privacy,
    owner: req.user._id, // from auth middleware
    videos: [],
  });

  // Response
  res.status(201).json({
    success: true,
    message: "Playlist created successfully",
    playlist,
  });
});

export const addVideoToPlaylist = asynchandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new apiError(400, "Invalid playlist ID");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError(400, "Invalid video ID");
  }

  // Find playlist
  const playlist = await playlistModel.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist not found");
  }

  // Find video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }

  // Check if video already in playlist
  if (playlist.videos.some(v => v.toString() === videoId)) {
    throw new apiError(400, "Video already exists in playlist");
  }

  // Add video
  playlist.videos.push(videoId);
  const updatedPlaylist = await playlist.save();

  // Response
  res.status(200).json({
    success: true,
    message: "Video added to playlist successfully",
    playlist: updatedPlaylist,
  });
});

export const deletePlaylist = asynchandler(async (req, res) => {
  const { playlistId } = req.params;

  // 1. Check if ID is provided
  if (!playlistId) {
    throw new apiError(400, "Playlist ID is required.");
  }

  // 2. Find playlist by ID
  const playlist = await playlistModel.findById(playlistId);

  if (!playlist) {
    throw new apiError(404, "Playlist not found.");
  }

  // 3. Ownership check
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not allowed to delete this playlist.");
  }

  // 4. Delete playlist
  await playlist.deleteOne();

  // 5. Respond
  res.status(200).json({
    success: true,
    message: "Playlist deleted successfully.",
  });
});

export const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id


    if(!mongoose.Types.ObjectId.isValid(playlistId)){
      throw new apiError(400,"invalid playlist id format")
    }
      
   const playlist = await playlistModel.findById(playlistId)
    .populate("owner","username email avatar")
    .populate("videos","thumbnail title duration views")
    .select("-__v")

    if(!playlist){
      throw new apiError(404,"play list doesnot found")
    }
    console.log(playlist.owner._id,req.user._id)
if (playlist.owner._id.toString() !== req.user._id.toString()) {
  throw new apiError(403, "Unauthorized request");
}
            
res.status(200)
.json(new ApiResponse (200," get playlist successfully",playlist))

})

export const deletePlaylistById = asynchandler(async(req,res)=>{
     const {playlistId} = req.params

     if(!mongoose.Types.ObjectId.isValid(playlistId)){
      throw new apiError(400,"invalid playlist format")
     }

     //owner check 
        
   const playlist = await playlistModel.findById(playlistId)

  //  if(!)
  

})




