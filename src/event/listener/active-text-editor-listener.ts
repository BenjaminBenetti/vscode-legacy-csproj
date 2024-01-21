import vscode from "vscode";
import { logger } from "../../logger";
import AbstractEventListener from "./abstract-event-listener";
import CsprojInclusionIndicator from "../../ui/status-bar/csproj-inclusion-indicator";

export default class ActiveTextEditorListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  constructor(
    private _csprojInclusionIndicator: CsprojInclusionIndicator,
    extensionContext: vscode.ExtensionContext,
  ) {
    super(extensionContext);
  }

  public bind(): void {
    this._csprojInclusionIndicator.updateIndicator();

    this.disposable = vscode.window.onDidChangeActiveTextEditor(() => {
      this._csprojInclusionIndicator.updateIndicator();
    });

    // auto cleanup when extension is deactivated
    this.extensionContext.subscriptions.push(this.disposable);

    logger.info("Active text editor listener bound");
  }

  public unbind(): void {
    this.disposable?.dispose();
  }
}
