import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword});
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ message: "Error registering User"});
    }
};

export const login = async (req: Request, res: Response):Promise<any> => {
    try{
        const { email, password} = req.body;
        const user = await User.findOne({ email });
        if(!user) 
            return res.status(400).json({ message: "User not found"});
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid Credentials"});

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {expiresIn: "1d"});
        res.json({ token, user});
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login error"});
    }
};

//GET /api/auth/profile
//protected
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try{
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        const user = await User.findById(userId).select("name email");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email
        })
    } catch (error: any) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error", error: error.message})
    }
};

//PUT /api/auth/profile
//protected
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try{
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        const {name, email, password} = req.body;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (name) user.name = name;
        if (email && email !== user.email) {
            const emailTaken = await User.findOne({email});
            if (emailTaken) {
                res.status(400).json({ message: "Email already in use"});
                return;
            }
            user.email = email;
        }
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        const updatedUser = await user.save();
        const userToReturn = updatedUser.toObject();
        delete (userToReturn as any).password;

        res.json(userToReturn);
    } catch (error: any) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error", error: error.message});
    }
};