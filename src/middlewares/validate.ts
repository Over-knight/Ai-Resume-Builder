import { AnyZodObject, Schema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateBody = (schema: AnyZodObject) => 
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
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

export const validateQuery = (schema: AnyZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);
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
