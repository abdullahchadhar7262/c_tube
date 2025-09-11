import apiError from "../utils/ApiError.js";
import asynhandler from "../utils/asyncHandler.js";

import uploadOnCloudnary from "../utils/cloudanry.js";

const uploadVideo = asynhandler(async (req, res) => {
  const { title, description, duration } = req.body;
  console.log(title, description, duration);
  console.log(req.files);

  const localThumbnailPath = req.files.thumbnail[0].path;
  const localCoverImagePath = req.files.thumbnail[0].path;
  const localvideoPath = req.files.video;

  if (!localCoverImagePath && !localThumbnailPath) {
    throw new apiError(400, "thumbnail and coverimage both are are required");
  }

  const cloudianryCoverImage = await uploadOnCloudnary(localCoverImagePath);
  const cloudianrythumbnail = await uploadOnCloudnary(localCoverImagePath);
  const cloudinaryVideos = await Promise.all(
    localvideoPath.map(async (file) => {
      return await uploadOnCloudnary(file.path);
    })
  );

     res.status(200)
     .json(200,"your video has been uploaded sucessfully")
});

export { uploadVideo };
