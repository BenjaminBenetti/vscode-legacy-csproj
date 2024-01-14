import * as vscode from "vscode";
import AbstractEventListener from "./abstract-event-listener";

export default class FileCreatedListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  // listen for events
  public bind(): void {
    this.disposable = vscode.workspace.onDidCreateFiles(
      (fileEvent: vscode.FileCreateEvent) => {
        let msg = "";

        for (const file of fileEvent.files) {
          msg += file.path + "\n";
        }

        vscode.window.showInformationMessage(msg);
      },
    );

    // auto cleanup when extension is deactivated
    this.extensionContext.subscriptions.push(this.disposable);
  }

  // stop listening for events
  public unbind(): void {
    this.disposable?.dispose();
  }
}
