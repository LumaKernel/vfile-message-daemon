import ipc from 'node-ipc';
import { dump } from '../utils/debug.js';
import { debug, daemonName } from './const.js';

const setup = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ipc.config.logger = debug.enabled ? dump : () => {};
  ipc.config.retry = 1500;
  ipc.config.maxRetries = false;
};

// For like one-off commands.
const setupShortLived = (): void => {
  setup();
  ipc.config.maxRetries = 0;
};

export const isRunning = (): Promise<boolean> => {
  setupShortLived();
  return new Promise((resolve) => {
    ipc.connectTo(daemonName, () => {
      const client = ipc.of[daemonName];
      client.on('connect', () => {
        resolve(true);
        ipc.disconnect(daemonName);
      });
      client.on('disconnect', () => {
        resolve(false);
        ipc.disconnect(daemonName);
      });
    });
    setTimeout(() => {
      resolve(false);
      ipc.disconnect(daemonName);
    }, 2000);
  });
};

export const stop = (): Promise<boolean> => {
  setupShortLived();
  return new Promise((resolve) => {
    ipc.connectTo(daemonName, () => {
      const client = ipc.of[daemonName];
      client.on('connect', () => {
        resolve(true);
        client.emit('stop', null);
        ipc.disconnect(daemonName);
      });
      client.on('disconnect', () => {
        resolve(false);
        ipc.disconnect(daemonName);
      });
    });
    setTimeout(() => {
      resolve(false);
      ipc.disconnect(daemonName);
    }, 2000);
  });
};

export interface Client {
  emit: <T = unknown>(name: string, data: T) => void;
  on: <T = unknown>(name: string, callback: (data: T) => void) => void;
  disconnect: () => void;
}

export const getClient = (): Promise<Client> => {
  setup();
  return new Promise((resolve) => {
    ipc.connectTo(daemonName, () => {
      const client = ipc.of[daemonName];
      resolve({
        emit: client.emit.bind(client),
        on: client.on.bind(client),
        disconnect: () => {
          ipc.disconnect(daemonName);
        },
      });
    });
  });
};

export const getClientShortLived = (): Promise<Client | null> => {
  setupShortLived();
  return new Promise((resolve) => {
    ipc.connectTo(daemonName, () => {
      const client = ipc.of[daemonName];
      client.on('connect', () => {
        resolve({
          emit: client.emit.bind(client),
          on: client.on.bind(client),
          disconnect: () => {
            ipc.disconnect(daemonName);
          },
        });
      });
      client.on('disconnect', () => {
        resolve(null);
      });
    });
    setTimeout(() => {
      resolve(null);
      ipc.disconnect(daemonName);
    }, 2000);
  });
};
