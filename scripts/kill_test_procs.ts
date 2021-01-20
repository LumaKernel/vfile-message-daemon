import find from "find-process";

const testSuffix = "vfile_message_daemon_test";

const main = async (): Promise<void> => {
  const procs = await find("name", testSuffix);
  console.info(`${procs.length} process found.`);
  procs.forEach((proc) => {
    process.kill(proc.pid);
  });
};

void main();
