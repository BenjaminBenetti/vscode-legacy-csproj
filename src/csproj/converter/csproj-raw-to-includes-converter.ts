import { Converter } from "../../converter/converter";
import CsprojInclude from "../meta/csproj-include";
import { CsprojIncludeType } from "../meta/csproj-include-type";

export default class CsprojRawToIncludesConverter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  implements Converter<any, CsprojInclude[]>
{
  // ========================================================
  // public methods
  // ========================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public convert(csproj: any): CsprojInclude[] {
    const includes: CsprojInclude[] = [];

    for (const projectItem of csproj.find((item: any) => !!item.Project)
      .Project) {
      if (projectItem.ItemGroup) {
        for (const itemGroupItem of projectItem.ItemGroup) {
          if (itemGroupItem.Compile) {
            // compile includes
            includes.push(
              new CsprojInclude(
                itemGroupItem[":@"]["@_Include"],
                CsprojIncludeType.Compile,
              ),
            );
          }

          if (itemGroupItem.Content) {
            // content includes
            includes.push(
              new CsprojInclude(
                itemGroupItem[":@"]["@_Include"],
                CsprojIncludeType.Content,
              ),
            );
          }
        }
      }
    }

    return includes;
  }
}
