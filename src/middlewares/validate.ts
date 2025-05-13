import { AnyZodObject, Schema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateBody = (Schema: AnyZodObject) => 
    (req: Request, res: Response, next: NextFunction) => {
        const result = Schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map(e => ({
                field: e.path.join("."),
                message: e.message
            }));
        res.status(400).json({ errors });
        return;
        }
        req.body = result.data;
        next();
    };

export const validateQuery = (Schema: AnyZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = Schema.safeParse(req.query);
        if (!result.success) {
            const errors = result.error.errors.map(e => ({
                field: e.path.join("."),
                message: e.message
            }));
        res.status(400).json({ errors });
        return;
        }
        req.query = result.data;
        next();
    };
