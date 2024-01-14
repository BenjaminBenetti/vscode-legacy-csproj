import * as vscode from "vscode";

export default interface EventListener {
  // listen for events
  bind(): void;

  // stop listening for events
  unbind(): void;

  // return the disposable context for this event listener if any
  get disposable(): vscode.Disposable | null;
}
