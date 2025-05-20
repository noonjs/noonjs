import { Request } from "express"

export type MyRequest = Request & {
    user?: any
    pagination?: any
    browser?: any
    config?: Config
    send?: (...params: any) => void
}

export type Config = {
    debug?: string
    base?: string
    port?: number
    cors?: {
        origin?: any
        credentials?: boolean
        [key: string]: any
    }
    mongodb?: string
    auth?: {
        collection: string
        secret: string
        refreshsecret?: string
        username?: string
        password?: string
        access?: number
        refresh?: number
    }
    collections: {
        [name: string]: {
            schema: any
            permissions: any
        }
    }
    io?: boolean
    limiter?: {
        window: number
        limit: number
    }
    error?: false | string | {
        [key: number | string]: string
    }
}

export type Events = "started" | "stopped" | "error" | "mongodb-connected" | "mongodb-disconnected" | "socket-connected" | "socket-disconnected"