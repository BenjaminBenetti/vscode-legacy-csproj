import * as path from "path";
import CsprojLocator from "./io/csproj-locator";
import CsprojInclude from "./meta/csproj-include";
import WorkspaceService from "../workspace/workspace-service";
import CsprojWriter from "./io/csproj-writer";
import CsprojIncludeTypeService from "./meta/csproj-include-type-service";
import { logger } from "../logger";

export default class CsprojService {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * add the given file to the csproj file on disk
   * @param filePath - the path to the file to add
   */
  public async addFileToCsproj(filePath: string): Promise<void> {
    const workspaceService = new WorkspaceService();
    const csprojWriter = new CsprojWriter();
    const csprojIncludeTypeService = new CsprojIncludeTypeService();

    const workspace = workspaceService.getWorkspacePathForFile(filePath);
    const csproj = await this.findNearestCsproj(filePath);

    if (csproj && workspace) {
      logger.info(
        `Adding ${filePath} to ${csproj} as type ${csprojIncludeTypeService.getIncludeTypeForFile(filePath)}`,
      );
      await csprojWriter.writeIncludeToCsproj(
        new CsprojInclude(
          path.relative(workspace, filePath),
          csprojIncludeTypeService.getIncludeTypeForFile(filePath),
        ),
        csproj,
      );
    }
  }

  /**
   * Find the nearest csproj to the given file
   * @param filePath - the path to the file
   * @returns - the path to the nearest csproj if found, null otherwise
   */
  public async findNearestCsproj(filePath: string): Promise<string | null> {
    const workspacePath = new WorkspaceService().getWorkspacePathForFile(
      filePath,
    );

    if (workspacePath) {
      return await new CsprojLocator().findNearestCsproj(
        path.dirname(filePath),
        workspacePath,
      );
    }
    return null;
  }
}