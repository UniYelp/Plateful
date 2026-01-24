import { readFile } from "node:fs/promises";

export const LUA_ACQUIRE_SCRIPT = await readFile(
	new URL("./script.lua", import.meta.url),
	"utf8",
);
