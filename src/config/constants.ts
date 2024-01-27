import { mongoConfigValidationSchema } from './mongo.config';
import { postgresConfigValidationSchema } from './postgres.config';
import { commonConfigValidationSchema } from './common.config';

export const validationSchema =
  mongoConfigValidationSchema &&
  postgresConfigValidationSchema &&
  commonConfigValidationSchema;
