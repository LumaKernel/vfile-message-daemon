import xdg from '@folder/xdg';
import path from 'path';
import fs from 'fs';
import util from 'util';
import { daemonName, debug } from '../daemon/const.js';

const dirs = xdg();
const debugLogFile = path.resolve(dirs.cache, 'vfile-reporter-daemon.log');

// eslint-disable-next-line import/prefer-default-export
export const dump = debug.enabled
  ? (obj: unknown): void => {
      fs.mkdirSync(dirs.cache, { recursive: true });
      fs.appendFileSync(
        debugLogFile,
        `${new Date().toString()}: ${process.pid}: ${daemonName}: ${util.inspect(obj)}\n`,
      );
    }
  : () => {
      // do nothing
    };
