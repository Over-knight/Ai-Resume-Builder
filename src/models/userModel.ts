import mongoose from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
}
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true, unique: true},
    isPremium: { type: Boolean, default: false}
});

export default mongoose.model<IUser>("User", UserSchema);