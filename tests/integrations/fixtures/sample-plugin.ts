import type { Node } from 'unist';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { z } from 'zod';

// eslint-disable-next-line import/prefer-default-export
export const samplePlugin: Plugin =
  () =>
  (tree, file): void => {
    const visitor = (node: Node) => {
      const { position } = node;
      const { value } = z.object({ value: z.string() }).parse(node);
      const warnMatch = value.match(/^WARN$/);
      const errorMatch = value.match(/^ERROR$/);
      [
        { match: warnMatch, fatal: false },
        { match: errorMatch, fatal: true },
      ].forEach(({ match, fatal }) => {
        if (match && typeof match.index === 'number') {
          const mes = file.message(
            `Problem: ${value}`,
            position && {
              start: {
                line: position.start.line,
                column: position.start.column + match.index,
              },
              end: {
                line: position.start.line,
                column: position.start.column + match.index + (match[0]?.length ?? 0),
              },
            },
          );
          mes.fatal = fatal;
        }
      });
    };
    visit(tree, 'TextNode', visitor);
  };
