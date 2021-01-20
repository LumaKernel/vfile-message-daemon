// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- target is es2015
/// <reference path="../node_modules/better-typescript-lib/lib.es6.d.ts" />

declare module "@folder/xdg" {
  export interface Dirs {
    cache: string;
  }
  const xdg: () => Dirs;
  export default xdg;
}
declare module "retext";
declare module "to-vfile" {
  import type { VFile } from "vfile";

  export const readSync: (path: string, format?: string) => VFile;
}

declare namespace NodeJS {
  interface ProcessEnv {
    TEST_VFMD_PREFIX?: string;
  }
}
