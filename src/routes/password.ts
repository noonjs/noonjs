import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import ModelFactory from "../model-factory";
import * as bcrypt from "bcrypt"

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.config?.auth?.collection)
            throw new Error("no_auth_collection")

        if (!req.user)
            throw new Error("no_token")

        const { _id } = req.user

        const { [req.config.auth.password]: candidate, ...rest } = req.body

        if (!candidate || !Object.values(rest)[0])
            throw new Error("bad_input")

        const newPassword = Object.values(rest)[0]

        if (candidate === newPassword)
            throw new Error("same_password")

        const user = await ModelFactory.get(req.config.auth.collection).findOne({ _id })

        if (!user)
            throw new Error("no_user")

        if (!bcrypt.compareSync(candidate, user.password))
            throw new Error("wrong_password")

        user[req.config.auth.password] = newPassword

        await user.save()
        res.json({ success: true })

    } catch (error) {
        next(error)
    }
}