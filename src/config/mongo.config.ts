import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const mongoConfig = registerAs('mongo', () => ({
  port: parseInt(process.env.MONGO_PORT),
  database: process.env.MONGO_DATABASE,
  host: process.env.MONGO_HOST,
  collection: process.env.MONGO_COLLECTION,
}));

export const mongoConfigValidationSchema = Joi.object({
  MONGO_PORT: Joi.string().required(),
  MONGO_DATABASE: Joi.string().required(),
  MONGO_HOST: Joi.string().required(),
  MONGO_COLLECTION: Joi.string().required(),
});
