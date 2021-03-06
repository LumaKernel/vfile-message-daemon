import { spawn } from "child_process";
import { dump } from "../utils/debug";
import { serverPath } from "./const";

export const start = (): number => {
  const child = spawn("node", [serverPath], {
    detached: true,
    env: { ...process.env },
    stdio: ["ignore", "ignore", "ignore"],
  });
  dump(`server pid: ${child.pid}`);
  return child.pid;
};
