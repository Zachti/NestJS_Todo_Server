import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const postgresConfig = registerAs('postgres', () => ({
  port: process.env.POSTGRES_PORT,
  url: process.env.POSTGRES_URL,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
}));

export const postgresConfigValidationSchema = Joi.object({
  POSTGRES_PORT: Joi.string().required(),
  POSTGRES_URL: Joi.string().uri().required(),
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
});
