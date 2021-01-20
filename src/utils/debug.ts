import xdg from "@folder/xdg";
import path from "path";
import fs from "fs";
import util from "util";
import { debug } from "../daemon/const";

const dirs = xdg();
const debugLogFile = path.resolve(dirs.cache, "vfile-reporter-daemon.log");

export const dump = debug.enabled
  ? (obj: unknown): void => {
      fs.mkdirSync(dirs.cache, { recursive: true });
      fs.appendFileSync(
        debugLogFile,
        `${new Date().toLocaleTimeString()}: ${util.inspect(obj)}\n`,
      );
    }
  : () => {
      // do nothing
    };
