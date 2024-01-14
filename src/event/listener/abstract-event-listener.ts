import * as vscode from "vscode";
import EventListener from "./event-listener";

export default abstract class AbstractEventListener implements EventListener {
  private _disposable: vscode.Disposable | null = null;
  private _extensionContext: vscode.ExtensionContext;

  // ========================================================
  // public methods
  // ========================================================

  public constructor(extensionContext: vscode.ExtensionContext) {
    this._extensionContext = extensionContext;
  }

  // listen for events
  public abstract bind(): void;

  // stop listening for events
  public abstract unbind(): void;

  // ========================================================
  // setters
  // ========================================================

  protected set disposable(disposable: vscode.Disposable | null) {
    this._disposable = disposable;
  }

  // ========================================================
  // getters
  // ========================================================

  public get disposable(): vscode.Disposable | null {
    return this._disposable;
  }

  protected get extensionContext(): vscode.ExtensionContext {
    return this._extensionContext;
  }
}
