import { spawn } from 'child_process';
import { dump } from '../utils/debug.js';
import { serverPath } from './const.js';

// eslint-disable-next-line import/prefer-default-export
export const start = (): number => {
  const child = spawn('node', [serverPath], {
    detached: true,
    env: { ...process.env },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  if (child.pid === undefined) throw new Error('Failed to start child');
  dump(`server pid: ${child.pid}`);
  return child.pid;
};
