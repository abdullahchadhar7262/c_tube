import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import uploadOnCloudnary from "../utils/cloudanry.js";
import ApiResponse from "../utils/apiRespose.js";
import jwt from "jsonwebtoken";
import asynhandler from "../utils/asyncHandler.js";
import e from "express";

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
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudnary(coverImageLocalPath)
    : null;
  console.log("avatar:", avatar);
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

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken = req.cookies.refreshToken;
  console.log(incommingRefreshToken);
  if (!incommingRefreshToken) {
    throw new apiError(401, "unauthorizes request");
  }
  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      `${process.env.JWT_SECRET_KEY}`
    );
    const user = await User.findById(decodedToken?._id);
    console.log(user);
    if (!user) {
      throw new apiError(401, "invalid refresh token");
    }
    if (incommingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh Token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Accesstoken is refreshed"
        )
      );
  } catch (error) {
    throw apiError(401, error?.message || "invalid user");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword, confirmpass } = req.body;
  console.log(oldpassword, newpassword, confirmpass);
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = user.isPasswordCorrect(oldpassword);

  if (!isPasswordCorrect) {
    throw apiError(400, "inalid password");
  }

  user.password = newpassword;

  user.save({ validateBeforeSave: false });
  if (user.password === confirmpass) {
    console.log("confirmed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "your password is reset successfully"));
});

const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, " current user fetched sucessfully");
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  console.log(fullname, email);
  if (!fullname && !email) {
    throw apiError(401, "full name and email is required");
  }
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: { fullname, email },
  }).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user details changed sucessfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "avatar file is required");
  }
  const avatar = await uploadOnCloudnary(avatarLocalPath);
  if (!avatar.url) {
    throw new apiError(401, "Error while uploading avatar");
  }

  const user = User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: avatar.secure_url,
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});
const updateUsercoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;

  if (!coverImageLocalPath) {
    throw new apiError(400, "avatar file is required");
  }
  const coverImage = await uploadOnCloudnary(coverImageLocalPath);
  if (!coverImage.secure_url) {
    throw new apiError(401, "Error while uploading coverImage");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      coverImage: coverImage.secure_url,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, user, "coverimage updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { user } = req.params; // this is username from URL

  if (!user) {
    throw new apiError(400, "username is missing");
  }

  const getUserChannelProfile = await User.aggregate([
    {
      $match: {
        username: user.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        username: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channelProfile || channelProfile.length === 0) {
    throw new apiError(404, "Channel not found");
  }

  res.status(200).json(new ApiResponse(200, channelProfile[0], "Channel profile fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "User watch history"));
});


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  currentUser,
  updateAccountDetail,
  updateUserAvatar,
  updateUsercoverImage,
  getWatchHistory,
  getUserChannelProfile
};
