import find from "find-process";

const testSuffix = "vfile_message_daemon_test";

const main = async (): Promise<void> => {
  if (process.platform === "win32") {
    console.warn("Warning: This tool does not work on Windows.");
  }
  const procs = await find("name", testSuffix);
  console.info(`${procs.length} process found.`);
  procs.forEach((proc) => {
    process.kill(proc.pid);
  });
};

void main();
