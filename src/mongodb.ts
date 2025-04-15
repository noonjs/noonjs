import mongoose from 'mongoose';
import { Events } from './types';

export default function (connection: string, emit: (event: Events, error?: any) => void) {

    mongoose.connection.on('connected', () => emit("mongodb-connected"))
    mongoose.connection.on('disconnected', () => emit("mongodb-disconnected"))
    mongoose.connection.on('error', (error) => emit("error", error.errorResponse?.errmsg))

    mongoose.connect(connection)
    mongoose.pluralize(null)
}