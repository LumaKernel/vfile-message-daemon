import waitForExpect from "wait-for-expect";
import { execFile } from "child_process";
import { promisify } from "util";
import assert from "assert";
import find from "find-process";
import { createDaemonContext, mainBinary } from "../helpers/daemon-context";

const ctx = createDaemonContext();

const execFileAsync = promisify(execFile);
test("start/status/stop daemon", async () => {
  let pid: string | undefined | null = null;

  {
    const child = await execFileAsync("node", [mainBinary, "start"], {
      env: process.env,
    });
    const matches = child.stdout.match(/\d+/);
    assert(matches);
    [pid] = matches;
    assert(pid);
    ctx.pushPid(pid);

    await waitForExpect(async () => {
      assert(pid);
      const procs = await find("pid", pid);
      const [proc] = procs;
      assert(proc);
      if (process.platform !== "win32") {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(proc.name).toContain("vfile_message_daemon");
      }
    }, 10000);

    assert(pid);
    const procs = await find("pid", pid);
    const [proc] = procs;

    assert(proc);
    if (process.platform !== "win32") {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(proc.name).toContain(ctx.localSuffix);
    }
  }

  {
    const child = await execFileAsync("node", [mainBinary, "status"], {
      env: process.env,
    });
    expect(child.stdout).not.toContain("not");
    expect(child.stdout).toContain("running");
  }

  {
    const child = await execFileAsync("node", [mainBinary, "stop"], {
      env: process.env,
    });

    expect(child.stdout).not.toContain("already");
    expect(child.stdout).toContain("stopped");

    const procs = await find("pid", pid);
    expect(procs).toHaveLength(0);
  }

  {
    const child = await execFileAsync("node", [mainBinary, "status"], {
      env: process.env,
    });
    expect(child.stdout).toContain("not");
    expect(child.stdout).toContain("running");
  }
});

test("status not running daemon", async () => {
  {
    const child = await execFileAsync("node", [mainBinary, "status"], {
      env: process.env,
    });
    expect(child.stdout).toContain("not");
    expect(child.stdout).toContain("running");
  }
});

test("stop not running daemon", async () => {
  {
    const child = await execFileAsync("node", [mainBinary, "stop"], {
      env: process.env,
    });
    expect(child.stdout).toContain("already");
    expect(child.stdout).toContain("stopped");
  }
});

test("start/restart daemon", async () => {
  let pid: string | undefined | null = null;

  {
    const child = await execFileAsync("node", [mainBinary, "start"], {
      env: process.env,
    });
    const matches = child.stdout.match(/\d+/);
    assert(matches);
    [pid] = matches;
    assert(pid);
    ctx.pushPid(pid);

    await waitForExpect(async () => {
      assert(pid);
      const procs = await find("pid", pid);
      const [proc] = procs;
      assert(proc);
    }, 10000);

    assert(pid);
    const procs = await find("pid", pid);
    const [proc] = procs;

    assert(proc);
  }

  {
    const child = await execFileAsync("node", [mainBinary, "restart"], {
      env: process.env,
    });
    const matches = child.stdout.match(/\d+/);
    assert(matches);
    const [newPid] = matches;
    assert(newPid);
    ctx.pushPid(newPid);

    expect(newPid).not.toEqual(pid);
    const oldProcs = await find("pid", pid);
    expect(oldProcs).toHaveLength(0);

    pid = newPid;

    await waitForExpect(async () => {
      assert(pid);
      const procs = await find("pid", pid);
      const [proc] = procs;
      assert(proc);
    }, 10000);

    assert(pid);
    const procs = await find("pid", pid);
    const [proc] = procs;

    assert(proc);
  }
});

test("restart daemon when not running", async () => {
  let pid: string | undefined | null = null;

  {
    const child = await execFileAsync("node", [mainBinary, "restart"], {
      env: process.env,
    });
    const matches = child.stdout.match(/\d+/);
    assert(matches);
    [pid] = matches;
    assert(pid);
    ctx.pushPid(pid);

    await waitForExpect(async () => {
      assert(pid);
      const procs = await find("pid", pid);
      const [proc] = procs;
      assert(proc);
    }, 10000);

    assert(pid);
    const procs = await find("pid", pid);
    const [proc] = procs;

    assert(proc);
  }
});
