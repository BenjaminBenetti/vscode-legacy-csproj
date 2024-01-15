import { OutputChannel, window } from "vscode";

class Logger {
  private _outputChannel: OutputChannel;
  // ========================================================
  // public methods
  // ========================================================

  constructor() {
    this._outputChannel = window.createOutputChannel("Legacy csproj");
  }

  public info(message: string): void {
    this._outputChannel.appendLine(`INFO: ${message}`);
  }

  public error(message: string): void {
    this._outputChannel.appendLine(`ERROR: ${message}`);
  }

  public warn(message: string): void {
    this._outputChannel.appendLine(`WARN: ${message}`);
  }
}

export const logger = new Logger();
