import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import { extract, replacer } from "../common";
import ModelFactory from "../model-factory";

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        const collection = req.params.collection

        const { permissions } = req.user ?? {}

        let { q: _q } = extract(permissions, req.config?.collections[collection].permissions, "delete")

        if (_q === true)
            _q = {}

        let { _id, query = await replacer({ _id, ..._q }, {
            auth: req.user,
            now: Date.now(),
            ip: req.ip || req.headers['x-forwarded-for']
        }) } = req.params

        const r = await ModelFactory.get(collection).findOneAndDelete(query)

        if (r) {
            req.send?.(r, "delete", permissions, collection)
            res.status(204).json()
        }
        else {
            throw new Error("not_found")
        }

    } catch (error) {
        next(error)
    }
}