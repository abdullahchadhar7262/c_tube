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

const uploadOnCloudnary   = async(LocalFilePath)=>{
  try {

    console.log("this is cloudinary",LocalFilePath)
    if(!LocalFilePath) return null
      const response = await cloudinary.uploader.upload(LocalFilePath,{resource_type:"auto"})
      console.log("your file is uploaded sucessfully",response)
      return response
  } catch (error) {
    fs.unlinkSync(LocalFilePath) // removes locally saved temporary file as the opertaion got temparorily failed
    return null
  }
        
}

export default uploadOnCloudnary