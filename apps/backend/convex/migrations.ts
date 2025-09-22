import { Migrations } from '@convex-dev/migrations';
import { components, internal } from './_generated/api.js';
import type { DataModel } from './_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);

export const completeTask = migrations.define({
    table: 'tasks',
    migrateOne: () => ({ isCompleted: true }),
});

export const run = migrations.runner();

export const runAll = migrations.runner([internal.migrations.completeTask]);
