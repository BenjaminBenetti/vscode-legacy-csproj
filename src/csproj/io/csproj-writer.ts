import { XMLBuilder } from "fast-xml-parser";
import CsprojRawToCsprojMetaConverter from "../converter/csproj-raw-to-csproj-meta-converter";
import CsprojInclude from "../meta/csproj-include";
import { Uri, workspace } from "vscode";
import { logger } from "../../logger";
import CsprojReader from "./csproj-reader";

export default class CsprojWriter {
  private static readonly CSPROJ_WRITE_RETRY_TIMES: number = 8;
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Write the given include to the csproj file at the given path
   * @param include - the include to write
   * @param csprojPath - the path to the csproj
   */
  public async writeIncludeToCsproj(
    include: CsprojInclude,
    csprojPath: string,
  ) {
    const csprojReader = new CsprojReader();
    const csproj = await csprojReader.loadCsprojRaw(csprojPath);

    this.addInsertToCsproj(include, csproj);

    await this.writeCsprojRaw(csprojPath, csproj);
  }

  /**
   * Delete the given include from the csproj file at the given path
   * @param include - the include to delete
   * @param csprojPath - the path to the csproj
   */
  public async deleteIncludeFromCsproj(
    include: CsprojInclude,
    csprojPath: string,
  ): Promise<void> {
    const csprojReader = new CsprojReader();
    const csproj = await csprojReader.loadCsprojRaw(csprojPath);

    this.removeInsertFromCsproj(include, csproj);

    await this.writeCsprojRaw(csprojPath, csproj);
  }

  /**
   * Add a new include to the raw csproj
   * @param include - the include to add
   * @param csproj - the raw csproj to modify
   */
  public addInsertToCsproj(include: CsprojInclude, csproj: any): void {
    const csprojMeta = new CsprojRawToCsprojMetaConverter().convert(csproj);

    //if the include already exists, do nothing
    if (csprojMeta.containsInclude(include)) {
      return;
    }

    let biggestItemGroup = (csproj as Array<any>)
      .find((item) => !!item.Project)
      .Project.filter((projectItem: any) => !!projectItem.ItemGroup)
      .map((projectItem: any) => projectItem.ItemGroup)
      .reduce((biggest: any, curr: any) => {
        if (!biggest) {
          return curr;
        } else {
          const biggestSize = biggest.filter(
            (bigItem: any) => !!bigItem[include.type],
          ).length;
          const currSize = curr.filter(
            (currItem: any) => !!currItem[include.type],
          ).length;
          return biggestSize > currSize ? biggest : curr;
        }
      }, null);

    // if there is no item group, create one
    if (!biggestItemGroup) {
      biggestItemGroup = [];
      csproj.Project.push(biggestItemGroup);
    }

    biggestItemGroup.push({
      ":@": { "@_Include": include.include },
      [include.type]: [],
    });
  }

  /**
   * Remove the given include from the csproj
   * @param include - the include to remove
   * @param csproj - the csproj to modify
   */
  public removeInsertFromCsproj(include: CsprojInclude, csproj: any): void {
    (csproj as Array<any>)
      .find((item) => !!item.Project)
      .Project.filter((projectItem: any) => !!projectItem.ItemGroup)
      .map((projectItem: any) => projectItem.ItemGroup)
      .forEach((itemGroup: any) => {
        const deleteIndex = itemGroup.findIndex(
          (item: any) =>
            item[include.type] && item[":@"]["@_Include"] === include.include,
        );

        if (deleteIndex !== -1) {
          itemGroup.splice(deleteIndex, 1);
        }
      });
  }

  // ========================================================
  // private methods
  // ========================================================

  /**
   * Write the given raw csproj to disk
   * @param csprojPath - the path to the csproj
   * @param csproj - the csproj to write
   */
  private async writeCsprojRaw(csprojPath: string, csproj: any): Promise<void> {
    const xmlWriter = new XMLBuilder({
      attributeNamePrefix: "@_",
      commentPropName: "#comment",
      ignoreAttributes: false,
      format: true,
      preserveOrder: true,
    });

    for (let i = 0; i < CsprojWriter.CSPROJ_WRITE_RETRY_TIMES; i++) {
      try {
        workspace.fs.writeFile(
          Uri.parse(csprojPath),
          Buffer.from(xmlWriter.build(csproj)),
        );
        break;
      } catch (err) {
        // Windows sometimes throws an error when writing to the csproj. because of
        // the stupid cannot write file because another process is using it error, Which linux doesn't have.
        // Why does windows have to be so lame?
        // Anyway, we try again a few times.
        logger.warn(`Got error while writing to csproj. Trying again: ${err}`);
      }

      if (i === CsprojWriter.CSPROJ_WRITE_RETRY_TIMES - 1) {
        throw new Error(
          `Failed to write to csproj after ${CsprojWriter.CSPROJ_WRITE_RETRY_TIMES} retries`,
        );
      }
    }
  }
}
