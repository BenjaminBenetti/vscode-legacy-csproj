import * as path from "path";
import CsprojLocator from "./io/csproj-locator";
import CsprojInclude from "./meta/csproj-include";
import WorkspaceService from "../workspace/workspace-service";
import CsprojWriter from "./io/csproj-writer";
import CsprojIncludeTypeService from "./meta/csproj-include-type-service";
import { logger } from "../logger";
import CsprojReader from "./io/csproj-reader";
import CsprojMeta from "./meta/csproj-meta";

export default class CsprojService {
  private _csprojWriterCache: CsprojWriter | null = null;
  private _isSdkStyleProjectCache: boolean | null = null;
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Create a new CsprojService
   * @param _buffer - [optional default false] whether or not to buffer the csproj in memory.
   *  You must call flush() to write the csproj to disk
   */
  constructor(private _buffer: boolean = false) {}

  /**
   * add the given file to the csproj file on disk
   * @param filePath - the path to the file to add
   */
  public async addFileToCsproj(filePath: string): Promise<void> {
    const workspaceService = new WorkspaceService();
    const csprojWriter = this.getCsprojWriter();
    const csprojIncludeTypeService = new CsprojIncludeTypeService();

    const workspace = workspaceService.getWorkspacePathForFile(filePath);
    const csproj = await this.findNearestCsproj(filePath);

    if (csproj && workspace) {
      if (!(await this.isSdkStyleProject(csproj))) {
        logger.info(
          `Adding ${filePath} to ${csproj} as type ${csprojIncludeTypeService.getIncludeTypeForFile(filePath)}`,
        );
        await csprojWriter.writeIncludeToCsproj(
          new CsprojInclude(
            path.relative(path.dirname(csproj), filePath),
            csprojIncludeTypeService.getIncludeTypeForFile(filePath),
          ),
          csproj,
        );
      } else {
        logger.warn("SDK style project detected. Not adding file.");
      }
    }
  }

  /**
   * Remove the given file from the csproj file on disk
   * @param filePath - the path of the file to remove
   */
  public async removeFileFromCsproj(filePath: string): Promise<void> {
    const workspaceService = new WorkspaceService();
    const csprojWriter = this.getCsprojWriter();
    const csprojIncludeTypeService = new CsprojIncludeTypeService();

    const workspace = workspaceService.getWorkspacePathForFile(filePath);
    const csproj = await this.findNearestCsproj(filePath);

    if (csproj && workspace) {
      if (!(await this.isSdkStyleProject(csproj))) {
        logger.info(`Removing ${filePath} from ${csproj}`);
        await csprojWriter.deleteIncludeFromCsproj(
          new CsprojInclude(
            path.relative(path.dirname(csproj), filePath),
            csprojIncludeTypeService.getIncludeTypeForFile(filePath),
          ),
          csproj,
        );
      } else {
        logger.warn("SDK style project detected. Not removing file");
      }
    }
  }

  /**
   * Read the given csproj file
   * @param csprojPath - the path to the csproj file
   * @returns - the csproj meta data
   */
  public async readCsproj(csprojPath: string): Promise<CsprojMeta> {
    const csprojReader = new CsprojReader();
    return await csprojReader.readCsproj(csprojPath);
  }

  /**
   * Check if the given file is in the nearest csproj to that file
   * @param filePath - the file to check
   * @returns - true if the file is in the csproj. false otherwise, including if there is no csproj above the file
   */
  public async isFileInCsproj(filePath: string): Promise<boolean> {
    const csprojReader = new CsprojReader();
    const includeTypeService = new CsprojIncludeTypeService();
    const csproj = await this.findNearestCsproj(filePath);

    if (csproj) {
      const projectMeta = await csprojReader.readCsproj(csproj);
      return projectMeta.containsInclude(
        new CsprojInclude(
          path.relative(path.dirname(csproj), filePath),
          includeTypeService.getIncludeTypeForFile(filePath),
        ),
      );
    } else {
      return false;
    }
  }

  /**
   * Flush any pending csproj changes to disk
   */
  public async flush(): Promise<void> {
    await this.getCsprojWriter().flush();
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

  /**
   * Check if the given csproj is an SDK style project
   * @param csprojPath - the path to the csproj
   * @returns - true if the csproj is an SDK style project, false otherwise
   */
  public async isSdkStyleProject(csprojPath: string): Promise<boolean> {
    if (!this._buffer || this._isSdkStyleProjectCache === null) {
      const csprojReader = new CsprojReader();
      const projectMeta = await csprojReader.readCsproj(csprojPath);
      const sdkProject = projectMeta.sdk !== null;
      this._isSdkStyleProjectCache = sdkProject;
      return sdkProject;
    } else {
      return this._isSdkStyleProjectCache;
    }
  }

  // ========================================================
  // private methods
  // ========================================================

  /**
   * Get a csproj writer. Could be cached or new depending on the buffer setting
   * @returns - a csproj writer
   */
  private getCsprojWriter(): CsprojWriter {
    if (this._buffer && this._csprojWriterCache) {
      return this._csprojWriterCache;
    } else if (this._buffer) {
      this._csprojWriterCache = new CsprojWriter(true);
      return this._csprojWriterCache;
    } else {
      return new CsprojWriter();
    }
  }
}
