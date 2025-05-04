import z from "zod";

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email(" Invalid Email"),
    password: z.string().min(6, "Password must be at least 6 charaters"),
});

export const loginSchema = z.object({
    email: z.string().email(" Invalid Email"),
    password: z.string().min(6, "Password required"),
});

export const updateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
});