import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import upload from "../utils/cloudnary.js";
import ApiResponse from "../utils/apiResponse.js";
const registerUser = asyncHandler(async(req,res)=>{
      // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

      const{fullname,email,username,password} = req.body
        console.log("email:",email)
      res.send("register user")

      if (
        [fullname,email,username,password].some((field)=>{
          field?.trim()===""
        })
      ) {
        throw new apiError(400,"all feilds are required");
        
      }
        const existedUser =  User.findOne({$or:[{email},{username}]})
        if(existedUser){
          throw new apiError(409,"user already exists");
          
        }
      const avatarLocalPath =  req.files?.avatar[0]?.Path
     const coverImagePath = req.files?.coverImage?.Path

     if(!avatarLocalPath){
      throw new apiError("400","avatar file is required");
     }

    const avatar= await upload(avatarLocalPath)
    const coverImage = await upload(coverImage)

    if(!avatar){
      throw new apiError("400,avatar is required");
      
    }
         
    const user = await User.create({
      fullname,
      username,
      avatar:avatar.url,
      coverImage:coverImage.url || "",
      email,
      password,
      uername:username.toLowerCase()
    })

           const createdUser = await User.findById(user._id).select("-password -refreshToken")

           if(!createdUser){
            throw new apiError(500,"something went wrong while registering the user the user")
           }
           
           return res.status(201).json(
            new ApiResponse(201,createdUser,"user created sucessfully ")
           )
})

export default registerUser