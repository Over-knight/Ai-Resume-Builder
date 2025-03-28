import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user  = await User.create({ name, email, password: hashedPassword});
        res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error registering User"});
    }
};

export const login = async (req: Request, res: Response):Promise<any> => {
    const { email, password} = req.body
    try{
        const user = await User.findOne({ email });
        if(!user) 
            return res.status(400).json({ message: "User not found"});
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid Credentials"});

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {expiresIn: "1d"});
        res.json({ token, user});
    } catch (error) {
        res.status(500).json({ message: "Login error"});
    }
};