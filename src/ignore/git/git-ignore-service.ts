import WorkspaceService from "../../workspace/workspace-service";
import IgnoreService from "../ignore-service";

export default class GitIgnoreService implements IgnoreService {
  private _globbyModule: any;
  private _globbyIgnoreCache: Map<string, any> = new Map();
  // ========================================================
  // public methods
  // ========================================================

  public async isFileIgnored(filePath: string): Promise<boolean> {
    const workspaceService = new WorkspaceService();

    const workspacePath = workspaceService.getWorkspacePathForFile(filePath);

    if (workspacePath) {
      if (!this._globbyModule) {
        // load ESM module on the fly
        this._globbyModule = await import("globby");
      }

      if (!this._globbyIgnoreCache.has(workspacePath)) {
        this._globbyIgnoreCache.set(
          workspacePath,
          await this._globbyModule.isGitIgnored({
            cwd: workspacePath,
          }),
        );
      }

      return this._globbyIgnoreCache.get(workspacePath)(filePath);
    }
    return false;
  }
}
