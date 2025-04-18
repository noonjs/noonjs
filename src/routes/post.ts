import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import { defaults, extract, omit, pick, replacer } from "../common";
import ModelFactory from "../model-factory";
import mongoose from "mongoose";

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        const collection = req.params.collection

        const permissions = req.user?.permissions ?? ["*"]

        let { pick: _pick, omit: _omit } = extract(permissions, req.config?.collections[collection].permissions, "post")

        var body = req.body

        if (_pick)
            body = pick(body, _pick)

        if (_omit)
            body = omit(body, _omit)

        //TODO: double check schema 

        const doc = await ModelFactory.get(collection).create(
            await
                defaults(req.config?.collections[collection].schema, body,
                    {
                        auth: req.user,
                        now: Date.now(),
                        ip: req.ip || req.headers['x-forwarded-for'],
                        rand: Math.ceil(Math.random() * 9999),
                        _id: new mongoose.Types.ObjectId(),
                        inc: async (key: string) => {
                            const d = await ModelFactory.get(collection).findOne({}, null, { sort: { createdAt: -1 } })
                            if (d && d[key])
                                return d[key] + 1
                            return 1
                        }
                    }));

        await doc.save();

        req.send?.(doc, "post", permissions, collection)

        res.json(doc);


    } catch (error) {
        next(error)
    }
}