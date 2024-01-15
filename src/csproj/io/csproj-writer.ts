import { XMLBuilder, XMLParser } from "fast-xml-parser";
import CsprojRawToCsprojMetaConverter from "../converter/csproj-raw-to-csproj-meta-converter";
import CsprojInclude from "../meta/csproj-include";
import { CsprojIncludeType } from "../meta/csproj-include-type";
import { Uri, workspace } from "vscode";
import { logger } from "../../logger";

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
    const xmlParser = new XMLParser({
      parseAttributeValue: true,
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      // preserveOrder: true,
      // commentPropName: "#comment",
    });
    const xmlWriter = new XMLBuilder({
      attributeNamePrefix: "@_",
      // commentPropName: "#comment",
      ignoreAttributes: false,
      format: true,
      // preserveOrder: true,
    });
    const csproj = xmlParser.parse(
      (await workspace.fs.readFile(Uri.parse(csprojPath))).toString(),
    );

    this.addInsertToCsproj(include, csproj);

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

  /**
   * Add a new include to the raw csproj
   * @param include - the include to add
   * @param csproj - the raw csproj to modify
   */
  public addInsertToCsproj(include: CsprojInclude, csproj: any): any {
    const csprojMeta = new CsprojRawToCsprojMetaConverter().convert(csproj);

    // if the include already exists, do nothing
    if (csprojMeta.containsInclude(include)) {
      return;
    }

    let biggestItemGroup = (csproj.Project.ItemGroup as Array<any>).reduce(
      (biggest, curr) => {
        switch (include.type) {
          case CsprojIncludeType.Content:
            return (curr.Content ? curr.Content.length : 0) >
              (biggest?.Content ? biggest.Content.length : 0)
              ? curr
              : biggest;
          case CsprojIncludeType.Compile:
            return (curr.Compile ? curr.Compile.length : 0) >
              (biggest?.Compile ? biggest.Compile.length : 0)
              ? curr
              : biggest;
        }
      },
      null,
    );

    // if there is no item group, create one
    if (!biggestItemGroup) {
      biggestItemGroup = { Content: [], Compile: [] };
      csproj.Project.ItemGroup = [biggestItemGroup];
    }

    biggestItemGroup[include.type.toString()].push({
      "@_Include": include.include,
    });
  }
}
