import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudanry.js"
import { Video } from "../models/video.model.js";
import ApiResponse from "../utils/apiRespose.js";
import { json } from "express";

export const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;
      console.log(req.files)
  if (!req.files?.thumbnail || !req.files?.coverImage) {
    throw new apiError(400, "Thumbnail and cover image are required");
  }
  if (!req.files?.video) {
    throw new apiError(400, "At least one video file is required");
  }

  const thumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path);
  const coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
  const videoUpload = await uploadOnCloudinary(req.files.video[0].path);
  console.log(videoUpload)

  const video = await Video.create({
    title,
    description,
    duration,
    thumbnail: thumbnail.secure_url,
    coverImage: coverImage.secure_url,
    owner: req.user._id,
    videoUrl: videoUpload.secure_url,
  });
           
  res.status(201).json({
    message: "Video uploaded successfully",
    video,
  });
});

export const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
   const video = await Video.findById(videoId).populate("owner","username email")
    if(!video){
      throw new apiError(400,"video not found")
    }

    if(video.ispublished){
      video.views =+1
      await video.save()
    }
    res.status(200).json(video)
})

export const updateVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.id;
  const { title, description } = req.body;

  const video = await Video.findById(videoId);
  if (!video) return res.status(404).json({ message: "Video not found" });

  if(video.owner.toString() !== req.user._id.toString()){
    throw new apiError(403,"unauthorized")
  }
  // Only update fields if provided
  if (title) video.title = title;
  if (description) video.description = description;

  // Thumbnail update
  if (req.file) {
    const result = await uploadOnCloudinary(req.file.path);
    video.thumbnail = result.secure_url; // ✅ correct URL
  }

  await video.save();
  res.status(200).json(new ApiResponse(200,{
  _id: video._id,
  title: video.title,
  description: video.description,
  thumbnail: video.thumbnail
}));
});


export const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.id;

  // 1️⃣ Find video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }

  // 2️⃣ Owner check
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "Not authorized");
  }

  // 3️⃣ Delete thumbnail from Cloudinary if exists
  if (video.thumbnail) {
    // Extract public_id from URL
    const segments = video.thumbnail.split("/");
    const filename = segments[segments.length - 1]; // e.g., "abc123.jpg"
    const publicId = filename.split(".")[0]; // remove extension

    await cloudinary.uploader.destroy(`thumbnails/${publicId}`);
  }

  // 4️⃣ Delete video document
  await video.deleteOne();

  // 5️⃣ Send response
  res.status(200).json({ message: "Video deleted successfully" });
});

export const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  // 🔹 Filtering
  let filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" }; // case-insensitive search
  }
  if (userId) {
    filter.owner = userId;
  }

  // 🔹 Sorting
  let sort = {};
  sort[sortBy] = sortType === "desc" ? -1 : 1;

  // 🔹 Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // 🔹 Query DB
  const [videos, total] = await Promise.all([
    Video.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Video.countDocuments(filter),
  ]);

  // ✅ Response
  return res.status(200).json(
    new ApiResponse(200, "Videos fetched successfully",{
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      videos,
    })
  );
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("ID mila:", id);

  const video = await Video.findById(id);
  console.log("Video mila:", video);

  if (!video) {
    return res.status(404).json({ success: false, message: "Video not found" });
  }

   console.log(req.user.id,video.owner.toString())

   if(video.owner.toString() !== req.user._id.toString()){
     throw  new apiError(400,"unauthorized request")
   }
   video.ispublished  = !video.ispublished
await video.save()


  res.json({ success: true, video });
});
