import CsprojRawToCsprojMetaConverter from "../converter/csproj-raw-to-csproj-meta-converter";
import CsprojInclude from "../meta/csproj-include";
import { CsprojIncludeType } from "../meta/csproj-include-type";

export default class CsprojWriter {
  // ========================================================
  // public methods
  // ========================================================

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
