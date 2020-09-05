import { Plug } from "https://x.nest.land/plug@0.0.4/mod.ts";
import { join } from "https://deno.land/x/std@0.68.0/path/mod.ts";

const VERSION = '0.1.0'
const HELLO_PLUG_URL = join(Deno.cwd(), '/target/release')
// const HELLO_PLUG_URL = `https://github.com/EathonYe/hello_deno/releases/download/${VERSION}/`

export interface Response<T> {
  err?: string,
  ok?: T
}

export interface Result {
  say: string,
}

let pluginId: number | null = null;


/**
 * Load the plugin
 */
export async function load(cache: boolean) {
  unload();
  pluginId = await Plug.prepare({
    name: "hello_deno",
    url: HELLO_PLUG_URL,
    policy: cache ? Plug.CachePolicy.STORE : Plug.CachePolicy.NONE,
  });
}

/**
 * Free the plugin resource
 */
export function unload(): void {
  if (pluginId !== null) Deno.close(pluginId);
  pluginId = null;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function decode(data: Uint8Array): object {
  const text = decoder.decode(data);
  return JSON.parse(text);
}

function encode(data: object): Uint8Array {
  const text = JSON.stringify(data);
  return encoder.encode(text);
}

function opSync<R extends Response<Result>>(op: string, data: object): R {
  if (pluginId === null) {
    throw "The plugin must be initialized before use";
  }

  const opId = Plug.getOpId(op);
  const response = Plug.core.dispatch(opId, encode(data))!;

  return decode(response) as R;
}

function unwrapResponse<T, R extends Response<T>>(response: R): T {
  if (response.err) {
    throw response.err;
  }

  if (response.ok) {
    return response.ok;
  }

  throw "Invalid response";
}

export function hello(name: string): string {
  const data = { name };
  return unwrapResponse<Result, Response<Result>>(opSync("hello_say", data)).say;
}

await load(false);