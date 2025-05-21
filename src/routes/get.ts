import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import { decoder, deepIntParse, extract, replacer } from "../common";
import ModelFactory from "../model-factory";
import qs from "qs";

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        const collection = req.params.collection

        if (!req.config?.collections[collection]) {
            next()
            return
        }

        const { permissions } = req.user ?? {}

        let { pagination, q: _q, project } = extract(permissions, req.config?.collections[collection].permissions, "get")

        const { limit: defaultLimit = 15, max, sort: defaultSort = {} } = pagination as any ?? {}

        if (_q === true)
            _q = {}

        let { limit = defaultLimit, skip = 0 } = req.query

        const { q, sort: _sort } = decoder(qs.parse(new URL(req.url!, `http://${req.headers.host}`).searchParams.toString()), req.config?.collections[collection].schema)

        const sort = deepIntParse(_sort ?? defaultSort)

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

        limit = parseInt(limit)
        skip = parseInt(skip.toString()) // TODO: check?

        if (max < limit)
            limit = max

        res.json(await ModelFactory.get(collection).find(query, project, { limit, skip, sort }))
    } catch (error) {
        next(error)
    }
}