import mongoose, { Schema } from "mongoose";


const subscription =  new mongoose.Schema({
        subscriber:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
},{timestamps:true})