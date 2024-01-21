// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import FileCreatedListener from "./event/listener/file-created-listener";
import { logger } from "./logger";
import FileDeleteListener from "./event/listener/file-delete-listener";
import FileRenameListener from "./event/listener/file-rename-listener";
import ActiveTextEditorListener from "./event/listener/active-text-editor-listener";
import RunActionCommand from "./command/run-action-command";
import CsprojInclusionIndicator from "./ui/status-bar/csproj-inclusion-indicator";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  logger.info("booting...");

  // === ui ===
  const csprojInclusionIndicator = new CsprojInclusionIndicator();

  // === event listeners ===
  new FileCreatedListener(context).bind();
  new FileDeleteListener(context).bind();
  new FileRenameListener(context).bind();
  new ActiveTextEditorListener(csprojInclusionIndicator, context).bind();

  // === commands ===
  new RunActionCommand(csprojInclusionIndicator, context).bind();

  logger.info("boot-up complete");
}

// This method is called when your extension is deactivated
export function deactivate() {}
