import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    isPremium: { type: Boolean, default: false}
});

export default mongoose.model("User", UserSchema);