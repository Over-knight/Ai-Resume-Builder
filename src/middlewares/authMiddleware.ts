import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayLoad {
    id: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayLoad;
        }
    }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, token missing"});
        return;
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayLoad;
        req.user = {id: decoded.id};
        next();
    } catch (error) {
        console.error("JWT verification error: ", error);
        res.status(401).json({ message: "Not authorized, token failed"});
        return;
    }
};

