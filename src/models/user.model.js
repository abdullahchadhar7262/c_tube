import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema =new mongoose.Schema({
    username:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true
    },
        email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },

        fullname:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index:true
    },
    avatar:{
         type:String, //cloudinary url
         required:true
    },
        coverImage:{
         type:String, //cloudinary url
         required:true
    },
            watchHistory:{
         type:Schema.Types.ObjectId, //cloudinary url
         ref:"Video",
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String,
    }


},{timestamps:true})
 userSchema.pre("save",async function name(next) {
    if(!this.ismodified("password")) return next()
    this.password= await bcrypt.hash(this.password,10,)
    next()
 })

 userSchema.methods.ispasswordCorrect = async function name(password) {
    return await bcrypt.compare(password,this.password)
 }

 userSchema.methods.generateAcessToken = function (params) {
    return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        fullName:this.fullName,
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
 }
 
 userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User",userSchema)