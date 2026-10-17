import { getSql } from './db.js';
import { createActivitiesRepository } from './repository.js';
import { createApiHandlers } from './api-handlers.js';

export const handlers = createApiHandlers(() => createActivitiesRepository(getSql()));
