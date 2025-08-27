import { Router } from "express";
import registerUser from "../controllers/user.controller.js"

const router = Router();

router.get("/login", (req, res) => {
    res.send("login user");
});

router.route("/register").post(registerUser)

export default router;