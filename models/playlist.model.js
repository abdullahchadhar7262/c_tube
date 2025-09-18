import mongoose, { Schema } from "mongoose";

export const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  privacy: {
    type: String,
    enum: ["public", "private", "unlisted"], // ✅ fixed
    default: "public"
  },
  videos: [ // ✅ changed to plural for clarity
    {
      type: Schema.Types.ObjectId,
      ref: "Video"
    }
  ]
}, { timestamps: true });

export default mongoose.model("Playlist", playlistSchema);
