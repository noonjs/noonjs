import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import { decoder, extract, omit, pick, replacer } from "../common";
import ModelFactory from "../model-factory";
import qs from "qs";

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        const collection = req.params.collection

        const permissions = req.user?.permissions ?? ["*"]

        let { q: _q, project, pick: _pick, omit: _omit } = extract(permissions, req.config?.collections[collection].permissions, "patch")

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

        if (project === true)
            project = []

        var body = req.body

        if (_pick)
            body = pick(body, _pick)

        if (_omit)
            body = omit(body, _omit)

        const doc = await ModelFactory.get(collection).findOneAndUpdate(query, body, { new: true, projection: project });
        req.send?.(doc, "patch", permissions, collection)
        res.json(doc);

    } catch (error) {
        next(error)
    }
}