import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"

export const verifyJwt = asyncHandler(async (req, _ , next) => {
  try {
    // ✅ should be req.cookies, not req.cookie
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(token,`${process.env.JWT_SECRET_KEY}`);

   
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid access Token");
  }
});
