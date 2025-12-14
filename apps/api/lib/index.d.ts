import * as elysia0 from "elysia";
import { Elysia } from "elysia";
import * as ai0 from "ai";
import * as _sinclair_typebox0 from "@sinclair/typebox";

//#region src/plugins/logger.d.ts
interface Logger {
  info(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  debug(...args: any[]): void;
  log(...args: any[]): void;
}
//#endregion
//#region src/server.d.ts
declare const app: Elysia<"", {
  decorator: {
    logger: Logger;
  };
  store: {};
  derive: {};
  resolve: {};
}, {
  typebox: {};
  error: {};
} & {
  typebox: {};
  error: {};
} & {
  typebox: {};
  error: {};
} & {
  typebox: {};
  error: {};
}, {
  schema: {};
  standaloneSchema: {};
  macro: {};
  macroFn: {};
  parser: {};
  response: {};
} & {
  schema: {};
  standaloneSchema: {};
  macro: {};
  macroFn: {};
  parser: {};
  response: {};
} & {
  schema: {};
  standaloneSchema: {};
  macro: {};
  macroFn: {};
  parser: {};
  response: {};
} & {
  schema: {};
  standaloneSchema: {};
  macro: {};
  macroFn: {};
  parser: {};
  response: {};
}, {
  get: {
    body: unknown;
    params: {};
    query: unknown;
    headers: {
      [x: string]: string | undefined;
      [x: number]: string;
    };
    response: {
      200: string;
      422: {
        type: "validation";
        on: string;
        summary?: string;
        message?: string;
        found?: unknown;
        property?: string;
        expected?: string;
      };
    };
  };
} & {
  v1: {
    bob: {
      get: {
        body: unknown;
        params: {};
        query: unknown;
        headers: unknown;
        response: {
          200: "bob";
        };
      };
    };
  };
} & {
  v1: {
    "generate-recipe": {
      post: {
        body: {
          ingredients: {
            name: string;
            quantity: "unlimited" | {
              value: number;
              unit: string | null;
            };
          }[];
          tools: string[] | "unlimited";
          tags: string[];
          temperatureUnit: "celsius" | "fahrenheit" | "kelvin";
          toleratedSpiceLevel: "none" | "medium" | "mild" | "hot";
        };
        params: {};
        query: unknown;
        headers: unknown;
        response: {
          200: {
            text: string;
            steps: ai0.StepResult<{
              convertMeasurementUnits: ai0.Tool<{
                value: number;
                from: "slice" | "gram" | "kilogram" | "ounce" | "pound" | "milliliter" | "liter" | "teaspoon" | "dessertspoon" | "tablespoon" | "cup" | "clove" | "leaf" | {
                  type: "other";
                  value: string;
                };
                to: "slice" | "gram" | "kilogram" | "ounce" | "pound" | "milliliter" | "liter" | "teaspoon" | "dessertspoon" | "tablespoon" | "cup" | "clove" | "leaf" | {
                  type: "other";
                  value: string;
                };
              }, {
                result: number | null;
              }>;
              convertTemperatures: ai0.Tool<{
                value: number;
                from: "celsius" | "fahrenheit" | "kelvin";
                to: "celsius" | "fahrenheit" | "kelvin";
              }, {
                result: number;
              }>;
            }>[];
            response: ai0.LanguageModelResponseMetadata & {
              messages: Array<ai0.AssistantModelMessage | ai0.ToolModelMessage>;
              body?: unknown;
            };
          };
          422: {
            type: "validation";
            on: string;
            summary?: string;
            message?: string;
            found?: unknown;
            property?: string;
            expected?: string;
          };
        };
      };
    };
  };
}, {
  derive: {};
  resolve: {};
  schema: {};
  standaloneSchema: {};
  response: {};
}, {
  derive: {};
  resolve: {};
  schema: {};
  standaloneSchema: {};
  response: {};
} & {
  derive: {};
  resolve: {};
  schema: {};
  standaloneSchema: {};
  response: {};
} & {
  derive: {};
  resolve: {};
  schema: {};
  standaloneSchema: {};
  response: {};
} & {
  derive: {};
  resolve: {};
  schema: {};
  standaloneSchema: {};
  response: {};
} & {
  derive: {
    readonly requestId: string;
  };
  resolve: {};
  schema: {};
  standaloneSchema: elysia0.UnwrapRoute<{
    schema: "standalone";
    headers: _sinclair_typebox0.TObject<{
      [x: string]: _sinclair_typebox0.TOptional<_sinclair_typebox0.TString>;
    }>;
  }, {}, "">;
  response: {};
} & {
  derive: {};
  resolve: {};
  schema: {};
  standaloneSchema: {};
  response: {};
} & {
  derive: {};
  resolve: {};
  schema: {};
  standaloneSchema: {};
  response: {};
}>;
type App = typeof app;
//#endregion
export { type App };