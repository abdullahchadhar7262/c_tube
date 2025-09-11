import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateUserAvatar,
  updateAccountDetail,
  updateUsercoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import upload from "../middlewares/mluter.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginUser);

const uploadMiddleware = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

router.post("/register", uploadMiddleware, registerUser);

router.post("/logout", verifyJwt, logoutUser);

router.post("/refreshToken", refreshAccessToken);

router.post("/reset_password", verifyJwt, changeCurrentPassword);
router.post("/updateAccountDetail", verifyJwt, updateAccountDetail);
router.patch(
  "/updateuserAvatar",
  verifyJwt,
  upload.single("avatar"),
  updateUserAvatar
);
router.patch(
  "/updateuserCoverImage",
  verifyJwt,
  upload.single("coverImage"),
  updateUsercoverImage
);
router.post("/channel/:username", verifyJwt, getUserChannelProfile);
router.post("/watchHistory", verifyJwt, getWatchHistory);

// router.route("/register").post(

//     upload.single('avatar'),
//     // upload.fields([
//     //     {name:"avatar",maxCount:1},
//     //      {name:"coverImage",maxCount:1}
//     // ]),
//     registerUser
// )

export default router;
