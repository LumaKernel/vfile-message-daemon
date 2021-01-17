// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- Target is es2015
/// <reference path="../node_modules/better-typescript-lib/lib.es6.d.ts" />

declare module "core_d" {
  const status: () => void;
  const restart: () => void;
  const stop: () => void;
  const start: () => void;
  const invoke: (args: string[]) => void;
  export { status, invoke, start, restart, stop };
}
