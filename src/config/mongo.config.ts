import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const mongoConfig = registerAs('mongo', () => ({
  port: parseInt(process.env.MONGO_PORT),
  url: process.env.MONGO_URL,
}));

export const mongoConfigValidationSchema = Joi.object({
  MONGO_PORT: Joi.string().required(),
  MONGO_URL: Joi.string().uri().required(),
});
