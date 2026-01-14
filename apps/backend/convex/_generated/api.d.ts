/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as errors_auth from "../errors/auth.js";
import type * as errors_custom from "../errors/custom.js";
import type * as errors_helpers from "../errors/helpers.js";
import type * as errors_index from "../errors/index.js";
import type * as errors_internal from "../errors/internal.js";
import type * as errors_not_found from "../errors/not_found.js";
import type * as external_user from "../external_user.js";
import type * as functions from "../functions.js";
import type * as households from "../households.js";
import type * as http from "../http.js";
import type * as ingredients from "../ingredients.js";
import type * as migrations from "../migrations.js";
import type * as migrations_index from "../migrations/index.js";
import type * as recipeGens from "../recipeGens.js";
import type * as recipes from "../recipes.js";
import type * as routes_webhooks from "../routes/webhooks.js";
import type * as triggers from "../triggers.js";
import type * as triggers_index from "../triggers/index.js";
import type * as users from "../users.js";
import type * as utils_soft_delete from "../utils/soft_delete.js";
import type * as values from "../values.js";
import type * as with_auth from "../with_auth.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  "errors/auth": typeof errors_auth;
  "errors/custom": typeof errors_custom;
  "errors/helpers": typeof errors_helpers;
  "errors/index": typeof errors_index;
  "errors/internal": typeof errors_internal;
  "errors/not_found": typeof errors_not_found;
  external_user: typeof external_user;
  functions: typeof functions;
  households: typeof households;
  http: typeof http;
  ingredients: typeof ingredients;
  migrations: typeof migrations;
  "migrations/index": typeof migrations_index;
  recipeGens: typeof recipeGens;
  recipes: typeof recipes;
  "routes/webhooks": typeof routes_webhooks;
  triggers: typeof triggers;
  "triggers/index": typeof triggers_index;
  users: typeof users;
  "utils/soft_delete": typeof utils_soft_delete;
  values: typeof values;
  with_auth: typeof with_auth;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  migrations: {
    lib: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { name: string },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
      cancelAll: FunctionReference<
        "mutation",
        "internal",
        { sinceTs?: number },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { limit?: number; names?: Array<string> },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      migrate: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize?: number;
          cursor?: string | null;
          dryRun: boolean;
          fnHandle: string;
          name: string;
          next?: Array<{ fnHandle: string; name: string }>;
          oneBatchOnly?: boolean;
        },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
    };
  };
};
