import mongoose, { Schema, Document, Model, model } from 'mongoose';
import { findHashFields } from './common';
import * as bcrypt from "bcrypt"

interface ModelCache {
  [modelName: string]: Model<any>;
}

const typeMapping: Record<string, any> = {
  array: Array,
  string: String,
  number: Number,
  boolean: Boolean,
  date: Date,
  hash: String
}

export default class ModelFactory {
  private static cache: ModelCache = {};
  static schemas: Record<string, any>;

  public static get(name: string): Model<any> {
    if (this.cache[name])
      return this.cache[name]

    if (!this.schemas[name])
      throw new Error("no_collection")

    const schemaDefinition: Record<string, any> = {};
    Object.entries(this.schemas[name] as [{ type: string }]).forEach(([field, fieldData]) => {
      schemaDefinition[field] = {
        ...fieldData,
        type: typeMapping[fieldData.type.toLowerCase()] || String
      };
    });

    const _schema = new Schema(schemaDefinition, { timestamps: true });

    const hashFields = findHashFields(this.schemas[name])

    if (hashFields)
      _schema.pre("save", async function (next) {

        hashFields.forEach(hashField => {
          if (!this.isModified(hashField)) {
            return next()
          }
          else {
            this[hashField] = bcrypt.hashSync(this[hashField] as string, bcrypt.genSaltSync(10))
            next()
          }
        })
      })

    this.cache[name] = mongoose.model(name, _schema)

    return this.cache[name]
  }
}