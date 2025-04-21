import { NextFunction, Response } from "express";
import { MyRequest } from "../types";

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("refresh")
        res.json({ logout: Date.now() })
    } catch (error) {
        next(error)
    }
}