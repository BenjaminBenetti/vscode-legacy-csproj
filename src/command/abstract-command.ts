import vscode from "vscode";

export default abstract class AbstractCommand {
  protected _disposable: vscode.Disposable | null = null;
  private readonly _extensionContext: vscode.ExtensionContext;

  // ========================================================
  // public methods
  // ========================================================

  public constructor(extensionContext: vscode.ExtensionContext) {
    this._extensionContext = extensionContext;
  }

  // register the command
  public abstract bind(): void;

  // deregister the command
  public unbind(): void {
    this._disposable?.dispose();
  }

  // ========================================================
  // getters
  // ========================================================

  protected get extensionContext(): vscode.ExtensionContext {
    return this._extensionContext;
  }
}
