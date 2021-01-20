import path from "path";
import find from "find-process";

const makeSuffix = (): string => {
  return Math.random().toString().slice(2, 7);
};

export const mainBinary = path.resolve(__dirname, "../../dist/bin/index.js");
export const globalSuffix = makeSuffix();

export interface DaemonContext {
  localSuffix: string;
  pushPid: (pid: string | number) => void;
  pids: number[];
}

export const createDaemonContext = (): DaemonContext => {
  const ctx: DaemonContext = Object.create(null) as any;
  beforeEach(() => {
    const localSuffix = globalSuffix + makeSuffix();
    const pids: number[] = [];
    process.env.TEST_VFMD_PREFIX = localSuffix;
    Object.assign(ctx, {
      localSuffix,
      pids,
      pushPid: (pid: string | number) => {
        pids.push(typeof pid === "number" ? pid : parseInt(pid, 10));
      },
    });
  });

  afterEach(() => {
    ctx.pids.forEach((pid) => {
      try {
        process.kill(pid);
      } catch (_e: unknown) {
        // ignore
      }
    });
  });

  afterAll(async () => {
    const procs = await find(
      "name",
      `vfile_message_daemon_test_${globalSuffix}`,
    );
    procs.forEach((proc) => {
      try {
        process.kill(proc.pid);
      } catch (_e: unknown) {
        // ignore
      }
    });
  });

  return ctx;
};
