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

    if (csproj.Project.ItemGroup) {
      for (const itemGroup of csproj.Project.ItemGroup) {
        // parse compiles
        if (itemGroup.Compile instanceof Array) {
          for (const compile of itemGroup.Compile) {
            includes.push(
              new CsprojInclude(
                compile["@_Include"],
                CsprojIncludeType.Compile,
              ),
            );
          }
        } else if (itemGroup.Compile) {
          includes.push(
            new CsprojInclude(
              itemGroup.Compile["@_Include"],
              CsprojIncludeType.Compile,
            ),
          );
        }

        // parse contents
        if (itemGroup.Content instanceof Array) {
          for (const content of itemGroup.Content) {
            includes.push(
              new CsprojInclude(
                content["@_Include"],
                CsprojIncludeType.Content,
              ),
            );
          }
        } else if (itemGroup.Content) {
          includes.push(
            new CsprojInclude(
              itemGroup.Content["@_Include"],
              CsprojIncludeType.Content,
            ),
          );
        }
      }
    }

    return includes;
  }
}
