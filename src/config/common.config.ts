import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const commonConfig = registerAs('common', () => ({
  databaseName: process.env.DATABASE_NAME,
  host: process.env.HOST,
}));

export const commonConfigValidationSchema = Joi.object({
  DATABASE_NAME: Joi.string().required(),
  HOST: Joi.string().required(),
});
