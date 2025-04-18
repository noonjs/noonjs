import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import { decoder, extract, replacer } from "../common";
import ModelFactory from "../model-factory";
import qs from "qs";

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        const collection = req.params.collection

        const permissions = req.user?.permissions ?? ["*"]

        let { q: _q } = extract(permissions, req.config?.collections[collection].permissions, "delete")

        if (_q === true)
            _q = {}

        const { q } = decoder(qs.parse(new URL(req.url!, `http://${req.headers.host}`).searchParams.toString()), req.config?.collections[collection].schema)

        const query = await replacer({
            ...q,
            ..._q
        }, {
            auth: req.user,
            now: Date.now(),
            ip: req.ip || req.headers['x-forwarded-for']
        })

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