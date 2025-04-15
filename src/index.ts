import express, { Express, NextFunction, Request, Response, Router } from "express"
import { Server as SocketIOServer } from 'socket.io'
import http, { Server } from 'http'
import ModelFactory from "./model-factory"
import cors from 'cors'
import BodyParser from "body-parser"
import cookieParser from "cookie-parser"
import { browser, auth, permissions, socket, mongodbNotConnected } from "./middlewares"
import { rateLimit } from "express-rate-limit"
import { get, post, patch, delete as _delete, total, register, login, refresh, password } from "./routes"
import mongodb from "./mongodb"
import { Config, Events, MyRequest } from "./types"
import currentUser from "./routes/current-user"
import EventEmitter from "events"
import { verify } from "jsonwebtoken"
import error from "./middlewares/error"
import { loadEnv } from "./load-env"
import { deepMerge } from "./common"
import debug from "debug"
import { logInfo } from "./debug"
/**
 * 
 */
export default class Noonjs {
    private config: Config
    private ev: EventEmitter
    private app: Express
    private server: Server
    private io: SocketIOServer | null

    constructor(config: Config) {
        if (process.env.NODE_ENV !== 'production')
            require('dotenv').config();

        const envConfig = loadEnv()
        this.config = deepMerge({
            debug: "",
            base: "/",
            port: 4000
        }, config, envConfig) as Config

        debug.enable(this.config.debug!)

        logInfo("👋 Debugger is now running...")
        logInfo(JSON.stringify(this.config, null, 2))

        if (Object.keys(this.config.collections).length === 0)
            throw new Error("no_collection")

        if (!this.config.mongodb)
            throw new Error('no_mongodb_uri')

        this.ev = new EventEmitter()

        this.app = express();

        this.server = http.createServer(this.app);
        this.server.on("error", e => this.emit("error", e))
        this.io = this.config.io === false ? null : new SocketIOServer(this.server)

        // 🤔
        ModelFactory.schemas = Object.fromEntries(Object.keys(this.config.collections).map(x => {
            return [x, this.config.collections[x].schema]
        }))

        this.middlewares()
        this.socket()
        mongodb(this.config.mongodb, (e, err) => this.emit(e, err))
    }

    on(event: Events, listener: (...args: any[]) => void) {
        return this.ev.on(event, listener)
    }

    off(event: Events, listener: (...args: any[]) => void) {
        return this.ev.off(event, listener)
    }

    private emit(event: Events, ...args: any[]) {
        if (this.ev.listenerCount(event) > 0)
            this.ev.emit(event, ...args)
    }

    private socket(): void {
        if (!this.io)
            return

        this.io.on('connection', (socket) => {
            const { token } = socket.handshake.auth

            socket.join("*")
            socket.leave(socket.id)

            if (token && this.config?.auth?.secret) {
                try {
                    const decoded = verify(token, this.config.auth.secret)

                    if (decoded) {
                        const { _id, permissions } = decoded as any
                        socket.join([_id, ...permissions])
                        this.emit("socket-connected", _id)
                    }
                } catch (err) {
                    this.emit("error", err)
                }
            } else {
                this.emit("socket-connected", null)
            }
            socket.on('error', err => this.emit("error", err))
            socket.on('disconnect', () => this.emit("socket-disconnected", socket.id))
        })
    }

    private middlewares(): void {
        this.app.use(BodyParser.json({
            type(req) {
                return true;
            }
        }))

        this.app.use(cookieParser());
        this.app.use(cors(this.config.cors));

        if (this.config.limiter)
            this.app.use(rateLimit({
                windowMs: this.config.limiter.window,
                limit: this.config.limiter.limit,
                standardHeaders: 'draft-8',
                legacyHeaders: false,
                message: "Too many requests from this IP, please try again later. 🤯"
            }))

        this.app.use(mongodbNotConnected)
        this.app.use((req: MyRequest, _: Response, next: NextFunction) => {
            logInfo(`${req.method} ${req.path} ${JSON.stringify(req.query)} ${!!req.browser ? "browser" : "non-browser"}`)
            if (req.body)
                logInfo(req.body)

            req.config = this.config
            next()
        })
        this.app.use(browser)
        this.app.use(socket(this.io))
        this.app.use(auth)
        this.app.use(permissions)
    }

    private routes(): void {
        const router = express.Router()

        router.get('/auth', currentUser)
        router.post('/auth/register', register)
        router.post('/auth/login', login)
        router.post('/auth/refresh', refresh)
        router.patch('/auth/password', password)

        router.get('/:collection', get)
        router.post('/:collection', post)
        router.patch('/:collection', patch)
        router.delete('/:collection', _delete)
        router.get('/:collection/total', total)

        this.app.use(this.config.base!, router);

        this.app.use(error(e => this.emit("error", e)))
    }

    /** 🛣️ Create a custom endpoint or middleware. */
    public use(pathOrMiddleware: string | ((req: Request, res: Response, next: NextFunction) => void), maybeRouter?: Router): void {
        try {
            if (typeof pathOrMiddleware === 'string' && maybeRouter)
                this.app.use(pathOrMiddleware, maybeRouter)
            else if (typeof pathOrMiddleware === 'function')
                this.app.use(pathOrMiddleware);
        } catch (error) {
            this.emit("error", error)
        }
    }

    /** ⚠️ Full model access without validation or permission checks. */
    public collection(name: string) {
        return ModelFactory.get(name)
    }

    /** 📨 Dispatch a custom Socket.IO message to clients. */
    public send(msg: any, to = "*") {
        return this.io?.in(to).emit(msg)
    }

    /** 🌄 Launch server. */
    start(): void {
        if (!this.server.listening) {
            // 💡 make sure user routes came first
            this.routes()
            this.server.listen(this.config.port, () => {
                this.emit("started", this.config.port)
            })
        }
    }

    /** Shutdown server. */
    stop(): void {
        if (!this.server.listen)
            return

        this.server.close(() => {
            this.emit("stopped")
        })
    }
}