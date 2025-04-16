import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import { extract, replacer } from "../common";
import ModelFactory from "../model-factory";

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        const collection = req.params.collection

        const { permissions } = req.user ?? {}

        let { q: _q } = extract(permissions, req.config?.collections[collection].permissions, "get")

        if (_q === true)
            _q = {}

        let { q = {}, query = await replacer({ ...q as {}, ..._q }, {
            auth: req.user,
            now: Date.now(),
            ip: req.ip || req.headers['x-forwarded-for']
        }) } = req.query

        res.json({ total: await ModelFactory.get(collection).countDocuments(query) })
    } catch (error) {
        next(error)
    }
}