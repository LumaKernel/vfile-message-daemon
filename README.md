# VFile Message Daemon

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

### LSP Settings

Configure following commands to your editors' LSP Client.

```shell
vfmd lsp
# You can also use stdin/stdout for communication.
# vfmd lsp --stdin
```

### Example for vim-lsp

```vim
if executable("vfmd")
  autocmd User lsp_setup call lsp#register_server({
    \   'name': 'vfmd-lsp',
    \   'cmd': {server_info->['vfmd', 'lsp', '--stdin']},
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

processor.process(vfile.readSync(fname), (err, file) => {
  if (err) throw err;
  console.error(report(file));
  reportToDaemon(file);
  file.extname = ".html";
  vfile.writeSync(file);
});
```
