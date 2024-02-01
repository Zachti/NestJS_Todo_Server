import { mongoConfigValidationSchema } from './mongo.config';
import { postgresConfigValidationSchema } from './postgres.config';

export const validationSchema =
  mongoConfigValidationSchema && postgresConfigValidationSchema;
