import {
  Diagnostic,
  DiagnosticSeverity,
  PublishDiagnosticsParams,
} from "vscode-languageserver";
import type { VFileMessage } from "vfile-message";
import type { VFile } from "vfile";

export type VFileDiagnostics = Required<Pick<VFile, "messages" | "path">>;
export const VFileMessageToLSPDiagnostic = (
  message: VFileMessage,
): Diagnostic => {
  return {
    severity: message.fatal
      ? DiagnosticSeverity.Error
      : DiagnosticSeverity.Warning,
    source: message.source ?? undefined,
    message: message.reason,
    range: {
      start: {
        line: message.location.start.line - 1,
        character: message.location.start.column - 1,
      },
      end: {
        line: message.location.end.line - 1,
        character: message.location.end.column - 1,
      },
    },
  };
  // TODO: RelatedInformation or something to show message.note
};

export const VFileToLSPDiagnostics = (
  vfile: VFileDiagnostics,
): PublishDiagnosticsParams => {
  return {
    uri: `file://${vfile.path}`,
    diagnostics: vfile.messages.map(VFileMessageToLSPDiagnostic),
  };
};
