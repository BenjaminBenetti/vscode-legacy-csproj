import { workspace } from "vscode";
import { ConfigKey } from "../config/config-key";
import { IgnoreFileBy } from "../config/ignore-file-by";
import GitIgnoreService from "./git/git-ignore-service";
import IgnoreService from "./ignore-service";
import { NoIgnoreService } from "./no-ignore-service";

export default class CsprojIgnoreService implements IgnoreService {
  private _ignoreService: IgnoreService;

  // ========================================================
  // public methods
  // ========================================================

  public constructor() {
    this._ignoreService = this.loadIgnoreService();
  }

  public async isFileIgnored(filePath: string): Promise<boolean> {
    return await this._ignoreService.isFileIgnored(filePath);
  }

  // ========================================================
  // private methods
  // ========================================================

  private loadIgnoreService(): IgnoreService {
    const ignoreSetting = workspace
      .getConfiguration(ConfigKey.Extension)
      .get(ConfigKey.IgnoreFilesBy) as IgnoreFileBy;

    switch (ignoreSetting) {
      case IgnoreFileBy.GitIgnore:
        return new GitIgnoreService();
      case IgnoreFileBy.None:
        return new NoIgnoreService();
      default:
        throw new Error(`Unknown ignore setting: ${ignoreSetting}`);
    }
  }
}
