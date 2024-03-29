# VFile Message Daemon

[![](https://img.shields.io/github/workflow/status/LumaKernel/vfile-message-daemon/Test?label=ci&style=flat-square)](https://github.com/LumaKernel/vfile-message-daemon/actions?query=workflow%3ATest)
[![](https://img.shields.io/github/workflow/status/LumaKernel/vfile-message-daemon/Release?label=release&style=flat-square)](https://github.com/LumaKernel/vfile-message-daemon/actions?query=workflow%3ARelease)
[![Luma Style Guide](https://img.shields.io/badge/styled%20with-luma-%23c5ebeb?style=flat-square)](https://github.com/luma-dev/luma-style-guide#readme)
[![](https://img.shields.io/npm/v/vfmd?style=flat-square)](https://www.npmjs.com/package/vfmd)
[![](https://img.shields.io/codecov/c/github/LumaKernel/vfile-message-daemon?style=flat-square)](https://codecov.io/gh/LumaKernel/vfile-message-daemon)

![vfile-message-daemon-v1-0-0](https://user-images.githubusercontent.com/29811106/105132160-c3b4e400-5b2d-11eb-8630-d9b8a7232808.png)

## Usage

### LSP User

```shell
npm install -g vfmd
vfmd start
vfmd status
vfmd stop
vfmd restart
```

Daemon should be running beforehand.

You can also use `vfmd start --attach` or `vfmd restart --attach` not to spawn detached process.

### LSP Settings

Configure following commands to your editors' LSP Client.

```shell
vfmd lsp
# You can also use stdin/stdout for communication.
# vfmd lsp --stdio
```

### Example for vim-lsp

```vim
if executable("vfmd")
  autocmd User lsp_setup call lsp#register_server({
    \   'name': 'vfmd-lsp',
    \   'cmd': {server_info->['vfmd', 'lsp', '--stdio']},
    \   'allowlist': ['text', 'markdown', 'html'],
    \ })
endif
```

### VFile reporter

```shell
npm install vfmd
```

```typescript
import unified from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";

import remark2retext from "remark-retext";
import english from "retext-english";
import indefiniteArticle from "retext-indefinite-article";
import vfile from "to-vfile";
import report from "vfile-reporter";

import { reportToDaemon } from "vfmd";

const fname = "path/to/dir/your.md";

const processor = unified()
  .use(markdown)
  .use(remark2retext, unified().use(english).use(indefiniteArticle))
  .use(remark2rehype)
  .use(html);

processor.process(vfile.readSync(fname), async (err, file) => {
  if (err) throw err;
  console.error(report(file));
  await reportToDaemon(file);
  file.extname = ".html";
  vfile.writeSync(file);
});
```
