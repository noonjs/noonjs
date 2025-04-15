import { Config } from "./types";

export function loadEnv(): Partial<Config> {
    return {
        debug: process.env.DEBUG,
        base: process.env.BASE,
        port: process.env.PORT ? +process.env.PORT : undefined,
        mongodb: process.env.MONGODB,

        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: process.env.CORS_CREDENTIALS === "true"
        },

        auth: {
            collection: process.env.AUTH_COLLECTION!,
            secret: process.env.AUTH_SECRET!,
            refreshsecret: process.env.AUTH_REFRESH_SECRET,
            username: process.env.AUTH_USERNAME!,
            password: process.env.AUTH_PASSWORD!,
            access: process.env.AUTH_ACCESS ? +process.env.AUTH_ACCESS : undefined,
            refresh: process.env.AUTH_REFRESH ? +process.env.AUTH_REFRESH : undefined
        },

        io: process.env.IO === "false" ? false : undefined,

        limiter: process.env.LIMITER_WINDOW && process.env.LIMITER_LIMIT ? {
            window: +process.env.LIMITER_WINDOW,
            limit: +process.env.LIMITER_LIMIT
        } : undefined,

        error: process.env.ERROR === "false"
            ? false
            : process.env.ERROR || undefined
    }
}