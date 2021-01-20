import createDebug from "debug";

export const daemonName = `vfile_message_daemon${
  process.env.TEST_VFMD_PREFIX ? `_test_${process.env.TEST_VFMD_PREFIX}` : ""
}`;
export const serverPath = require.resolve("./server");
export const debug = createDebug(
  `vfile_message_daemon${
    process.env.TEST_VFMD_PREFIX ? `:test:${process.env.TEST_VFMD_PREFIX}` : ""
  }`,
);
