import { workspace } from "vscode";
import { Converter } from "../../converter/converter";
import CsprojInclude from "../meta/csproj-include";
import { CsprojIncludeType } from "../meta/csproj-include-type";
import { ConfigKey } from "../../config/config-key";
import { FileTagMapping } from "../../config/file-tag-mapping";

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
    const fileTagMappings = workspace
      .getConfiguration(ConfigKey.Extension)
      .get(ConfigKey.FileTagMappings) as FileTagMapping[];

    for (const projectItem of csproj.find((item: any) => !!item.Project)
      .Project) {
      if (projectItem.ItemGroup) {
        for (const itemGroupItem of projectItem.ItemGroup) {
          const mapping = fileTagMappings.find(
            (map) => !!itemGroupItem[map.tag],
          );

          if (mapping) {
            // compile includes
            includes.push(
              new CsprojInclude(itemGroupItem[":@"]["@_Include"], mapping.tag),
            );
          } else if (itemGroupItem.Content) {
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
