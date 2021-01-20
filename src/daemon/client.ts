import ipc from "node-ipc";
import { dump } from "../utils/debug";
import { debug, daemonName } from "./const";

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
      client.on("connect", () => {
        ipc.disconnect(daemonName);
        resolve(true);
      });
      client.on("disconnect", () => {
        ipc.disconnect(daemonName);
        resolve(false);
      });
    });
    setTimeout(() => {
      ipc.disconnect(daemonName);
      resolve(false);
    }, 2000);
  });
};

export const stop = (): Promise<boolean> => {
  setupShortLived();
  return new Promise((resolve) => {
    ipc.connectTo(daemonName, () => {
      const client = ipc.of[daemonName];
      client.on("connect", () => {
        client.emit("stop", null);
        ipc.disconnect(daemonName);
        resolve(true);
      });
      client.on("disconnect", () => {
        ipc.disconnect(daemonName);
        resolve(false);
      });
    });
    setTimeout(() => {
      ipc.disconnect(daemonName);
      resolve(false);
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
        ...client,
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
      client.on("connect", () => {
        resolve({
          ...client,
          disconnect: () => {
            ipc.disconnect(daemonName);
          },
        });
      });
      client.on("disconnect", () => {
        resolve(null);
      });
    });
    setTimeout(() => {
      ipc.disconnect(daemonName);
      resolve(null);
    }, 2000);
  });
};
