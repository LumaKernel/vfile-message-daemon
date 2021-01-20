# Contributing

Welcome contributing by PR and submitting Issues.
Before submitting PR, please check whether you can agree the license or not.

## Prerequisite

- Node.js, npm

## How to dev

- `npm run watch`
- `node ./dist/bin/index.js args...` to check the command.
  - `node ./dist/bin/index.js start`
  - `node ./dist/bin/index.js stop`
- `node ./dist/bin/debug_daemon_server.js` to start server with attaching stdin/stdout.
  - Easy to debug rather than `... start`.
- `ps aux | grep vfile_message_daemon` to check processes.
- `watch 'ps aux | grep vfile_message_daemon'` to monitor processes.
- `npx ts-node ./scripts/kill_test_procs.ts` to kill remained processes by failed test running.

## Rules

- Follow `eslint` rules. Easy to fix by `npm run fix`.
- File and dir names are lower-snake-cased only. Easy to convert composite words to this. Split into some words, lower-case all, and join them with hyphen.
  - Example: `URLJoin3To2` -> `[URL, Join, 3, To, 2]` -> `[url, join, 3, to, 2]` -> `url-join-3-to-2`

