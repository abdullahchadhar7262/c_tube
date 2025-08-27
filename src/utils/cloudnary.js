// Require the cloudinary library
import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
import { fileURLToPath } from 'url';
// Return "https" URLs by setting secure: true
  cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:COUDNARY_API_KEY,
    api_secret:"COUDNARY_API_SECRET"
  })

const uploadOnCloudnary   = async(LocalFilePath)=>{
  try {
    if(!LocalFilePath) return null
      const response = await cloudinary.uploader.upload(LocalFilePath,{resource_type:"auto"})
      console.log("your file is uploaded sucessfully",response.url)
      return response
  } catch (error) {
    fs.unlinkSync(LocalFilePath) // removes locally saved temporary file as the opertaion got temparorily failed
    return null
  }
        
}
