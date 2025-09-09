// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app from "./app.js";
dotenv.config({
    path: './.env'
})

const Port=process.env.PORT


connectDB()
.then(() => {
    app.listen(Port || 8000, () => {
        console.log(`⚙️ Server is running at port : ${Port}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})