import path from "path";
import find from "find-process";

const makeSuffix = (): string => {
  return Math.random().toString().slice(2, 7);
};

export const mainBinary = path.resolve(__dirname, "../../dist/bin/index.js");
export const globalSuffix = makeSuffix();

export interface DaemonContext {
  localSuffix: string;
}

export const createDaemonContext = (): DaemonContext => {
  const ctx: any = Object.create(null);
  beforeEach(() => {
    const localSuffix = globalSuffix + makeSuffix();
    process.env.TEST_VFMD_PREFIX = localSuffix;
    Object.assign(ctx, {
      localSuffix,
    });
  });

  afterAll(async () => {
    const procs = await find(
      "name",
      `vfile_message_daemon_test_${globalSuffix}`,
    );
    procs.forEach((proc) => {
      process.kill(proc.pid);
    });
  });

  return ctx;
};
