import type { Diagnostic, PublishDiagnosticsParams } from 'vscode-languageserver';
import { DiagnosticSeverity } from 'vscode-languageserver';
import type { VFileMessage } from 'vfile-message';
import type { VFile } from 'vfile';

export type VFileDiagnostics = Required<Pick<VFile, 'messages' | 'path'>>;
export const VFileMessageToLSPDiagnostic = (message: VFileMessage): Diagnostic => {
  return {
    severity: message.fatal ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
    source: message.source ?? undefined,
    message: message.reason,
    range: {
      start: {
        line: (message.position?.start.line ?? message.line ?? 1) - 1,
        character: (message.position?.start.column ?? message.column ?? 1) - 1,
      },
      end: {
        line: (message.position?.end.line ?? message.line ?? 1) - 1,
        character: (message.position?.end.column ?? message.column ?? 1) - 1,
      },
    },
  };
  // TODO: RelatedInformation or something to show message.note
};

export const VFileToLSPDiagnostics = (vfile: VFileDiagnostics): PublishDiagnosticsParams => {
  return {
    uri: `file://${vfile.path}`,
    diagnostics: vfile.messages.map(VFileMessageToLSPDiagnostic),
  };
};
