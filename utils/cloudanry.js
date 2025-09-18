// Require the cloudinary library
import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
import { fileURLToPath } from 'url';
// Return "https" URLs by setting secure: true
  cloudinary.config({
  
 cloud_name:"dclwk6yun",
    api_key:"147852622976198",
    api_secret:"_6p-YxOrkD69rHxRbtxjw83IqIU"



    // cloud_name:process.env.CLOUDNIARY_CLOUD_NAME,
    // api_key:process.env.CLOUDNIARY_API_KEY,
    // api_secret:process.env.CLOUDNIARY_API_SECRET
  })

const uploadOnCloudnary = async (LocalFilePath, resourceType) => {
  try {
    if (!LocalFilePath) return null;

    // Prepare options object
    let options = {
      resource_type: resourceType,
    };

    // Only add eager streaming options for videos
    if (resourceType === "video") {
      options.eager = [{ streaming_profile: "full_hd", format: "m3u8" }];
      options.eager_async = true;
    }

    const response = await cloudinary.uploader.upload(LocalFilePath, options);
    console.log("Upload response:", response);
    return response;
  } catch (error) {
    fs.unlinkSync(LocalFilePath);
    console.error("Upload failed:", error);
    return null;
  }
};


export default uploadOnCloudnary