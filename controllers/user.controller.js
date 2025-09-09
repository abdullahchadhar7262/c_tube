import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import uploadOnCloudnary from "../utils/cloudanry.js";
import ApiResponse from "../utils/apiRespose.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId); // ✅ fixed
    if (!user) throw new apiError(404, "User not found");

    const accessToken = user.generateAccessToken(); // ✅ fixed name
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error); // 👀 debug log
    throw new apiError(
      500,
      "Something went wrong while generating refresh token and access token"
    );
  }
};

// ✅ Register user
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("email:", email);
  console.log("files:", req.files);

  if (
    [fullname, email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new apiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudnary(avatarLocalPath);
  const coverImage = coverImageLocalPath? await uploadOnCloudnary(coverImageLocalPath): null;
     console.log("avatar:",avatar)
  if (!avatar) {
    throw new apiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

// ✅ Login user
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new apiError(400, "Username or email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) throw new apiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new apiError(401, "Invalid credentials");

  const { refreshToken, accessToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // ✅ fixed cookie names
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// ✅ Logout user
const logoutUser = asyncHandler(async (req, res) => {
  const options = { httpOnly: true, secure: true }; // ✅ added options here

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User Logged out"));
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
      const incommingRefreshToken = req.cookies.refreshToken
          console.log(incommingRefreshToken)
      if(!incommingRefreshToken){
        throw new apiError(401,"unauthorizes request")
      }
   try {
     const decodedToken = jwt.verify(incommingRefreshToken,`${process.env.JWT_SECRET_KEY}`)
    const user = await User.findById(decodedToken?._id)
    console.log(user)
    if(!user){
                throw new apiError(401,"invalid refresh token")
    }
    if(incommingRefreshToken !== user?.refreshToken){
    throw new apiError(401,"Refresh Token is expired or used")
    }

    const options = {
      httpOnly:true,
      secure:true
    }
  const {accessToken,newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
   res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
    new ApiResponse(
      200,{accessToken,refreshToken:newRefreshToken},"Accesstoken is refreshed"
    ))
   } catch (error) {
       throw apiError(401,error?.message || "invalid user")
   }
})
export { registerUser, loginUser, logoutUser ,refreshAccessToken};
