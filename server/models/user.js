import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  usuario: {
    type: String,
    unique: true,
  },
  password: String,
});

export const User = mongoose.model("User", UserSchema);
