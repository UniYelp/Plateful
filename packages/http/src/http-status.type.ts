import type { HttpStatusCode } from "./http-status-code.enum";

export type HttpStatus = keyof typeof HttpStatusCode;
