import { NextFunction, Response } from "express"
import { MyRequest } from "../types"
import { extract, pick } from "../common"

export default (io: any) => {
    return (req: MyRequest, _: Response, next: NextFunction) => {
        req.send = (doc: any, method: "post" | "patch" | "delete", permissions: any, collection: string) => {

            if (!permissions || !collection)
                return

            const responses = {
                post: 'created',
                patch: 'updated',
                delete: 'deleted'
            }

            let { io: tos } = extract(permissions, req.config?.collections[collection].permissions, method)

            if (!tos || tos === true)
                tos = { "*": true }

            Object.entries<string[] | boolean>(tos).forEach(([to, projection]) => {

                if (projection === true)
                    projection = []

                if (to.includes("$.")) {
                    const [_, field] = to.split(".")
                    to = doc[field]
                }

                io.in(to).emit('collection', responses[method], collection, (projection as []).length > 0 ? pick(doc, projection as []) : doc, to);
            })
        }
        next()
    }
}