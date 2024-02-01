import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const postgresConfig = registerAs('postgres', () => ({
  url: process.env.POSTGRES_URL,
}));

export const postgresConfigValidationSchema = Joi.object({
  POSTGRES_URL: Joi.string().uri().required(),
});
