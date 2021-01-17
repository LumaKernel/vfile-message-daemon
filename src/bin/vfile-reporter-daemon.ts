#!/usr/bin/env node

// eslint-disable-next-line camelcase
import core_d from "core_d";
import { setupEnv } from "./utils/env_setup";

const cmd = process.argv[2];

setupEnv();

if (
  cmd === "start" ||
  cmd === "stop" ||
  cmd === "restart" ||
  cmd === "status"
) {
  core_d[cmd]();
} else {
  // core_d does not support no args
  core_d.invoke(["op", ...process.argv.slice(2)]);
}
