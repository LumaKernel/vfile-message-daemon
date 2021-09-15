import type { InitializeParams, InitializeResult, PublishDiagnosticsParams } from 'vscode-languageserver';
import { TextDocuments, DidChangeConfigurationNotification, TextDocumentSyncKind } from 'vscode-languageserver';

import { IPCMessageReader, IPCMessageWriter, createConnection } from 'vscode-languageserver/node.js';

import { TextDocument } from 'vscode-languageserver-textdocument';
import type { Client } from '../daemon/client.js';
import { getClient } from '../daemon/client.js';
import { dump } from '../utils/debug.js';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Settings {}

export interface StartLanguageServerOptions {
  stdio: boolean;
}

export const startLanguageServer = ({ stdio }: StartLanguageServerOptions): void => {
  dump({ stdio, createConnection });

  const connection = stdio
    ? createConnection(process.stdin, process.stdout)
    : createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

  // Create a simple text document manager.
  const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  const defaultSettings: Settings = {};
  let globalSettings: Settings = defaultSettings;

  const documentSettings: Map<string, Thenable<Settings>> = new Map();

  let hasConfigurationCapability = false;
  let hasWorkspaceFolderCapability = false;
  let hasDiagnosticRelatedInformationCapability = false;
  void hasDiagnosticRelatedInformationCapability;

  const getDocumentSettings = async (resource: string): Promise<Settings> => {
    if (!hasConfigurationCapability) {
      return Promise.resolve(globalSettings).then((s) => ({
        ...defaultSettings,
        ...s,
      }));
    }
    let result = documentSettings.get(resource);
    if (!result) {
      result = connection.workspace.getConfiguration({
        scopeUri: resource,
        section: 'languageServerExample',
      });
      documentSettings.set(resource, result);
    }
    return result.then((s) => ({ ...defaultSettings, ...s }));
  };
  void getDocumentSettings;

  let daemonClient: Client | null = null;
  dump('client: getting client...');
  void getClient().then((daemonClient0) => {
    dump('client: ready');
    daemonClient = daemonClient0;
    daemonClient.on<PublishDiagnosticsParams[]>('notifyFiles', (diagnosticsList) => {
      dump('client: notifyFiles received');
      dump(diagnosticsList);
      diagnosticsList.forEach((diagnostics) => {
        connection.sendDiagnostics(diagnostics);
      });
    });
    daemonClient.emit('getAllFiles', null);
  });

  connection.onInitialize((params: InitializeParams) => {
    dump('onInitialize');
    const { capabilities } = params;

    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        // Tell the client that this server supports code completion.
        completionProvider: {
          resolveProvider: true,
        },
      },
    };
    if (hasWorkspaceFolderCapability) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };
    }
    return result;
  });

  connection.onInitialized(() => {
    dump('onInitialized');
    if (hasConfigurationCapability) {
      void connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
      connection.workspace.onDidChangeWorkspaceFolders((_event) => {
        connection.console.log('Workspace folder change event received.');
      });
    }
  });

  // The example settings
  connection.onDidChangeConfiguration((change) => {
    dump('onDidChangeConfiguration');
    if (hasConfigurationCapability) {
      documentSettings.clear();
    } else {
      globalSettings = <Settings>(change.settings.languageServerExample || defaultSettings);
    }
  });

  documents.onDidClose((e) => {
    dump('onDidClose');
    dump(e.document.uri);
    documentSettings.delete(e.document.uri);
  });

  documents.onDidChangeContent((_change) => {
    dump('onDidChangeContent');
    daemonClient?.emit('getAllFiles', null);
  });

  connection.onDidChangeWatchedFiles((_change) => {
    dump('onDidChangeWatchedFiles');
    connection.console.log('We received a file change event');
    daemonClient?.emit('getAllFiles', null);
  });

  documents.listen(connection);
  connection.listen();

  process.on('exit', () => {
    dump('client: exit');
    daemonClient?.disconnect();
  });
};
