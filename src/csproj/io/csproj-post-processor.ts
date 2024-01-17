import { workspace } from "vscode";
import { ConfigKey } from "../../config/config-key";
import { LineEnding } from "../../config/line-ending";
import os from "os";

export default class CsprojPostProcessor {
  // ========================================================
  // public methods
  // ========================================================

  /**
   * Apply post-processing transforms to the csproj because visual studio
   * doesn't conform to the xml spec.
   * @param csproj - the csproj to process
   * @returns - the processed csproj
   */
  public process(csproj: string): string {
    const applyVSCompatTransforms = workspace
      .getConfiguration(ConfigKey.Extension)
      .get(ConfigKey.VisualStudioCompatTransforms) as boolean;

    let formattedCsproj = this.formatXmlLineEndings(csproj);
    if (applyVSCompatTransforms) {
      formattedCsproj = this.unescape(formattedCsproj);
      formattedCsproj = this.insertSpacesInClosingTags(formattedCsproj);
      formattedCsproj = this.insertTheBOM(formattedCsproj);
    }

    return formattedCsproj;
  }

  // ========================================================
  // private methods
  // ========================================================

  /**
   * Silly windows and its BOM. This method inserts the byte order mark
   * in to the utf-8 encoded xml string
   * @param xml - the xml to insert the BOM in to
   * @returns - the xml with the BOM inserted
   */
  private insertTheBOM(xml: string): string {
    return "\ufeff" + xml;
  }

  /**
   * Replace xml escape sequences with their unescaped values
   * @param xml - the xml to unescape
   * @returns - the unescaped xml
   */
  private unescape(xml: string): string {
    return xml
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&");
  }

  /**
   * Visual studio puts an extra space between the attributes and the closing tag
   * ex. <foobar baz="qux" />. This method apes that behavior.
   * @param xml - the xml to process
   * @returns - the processed xml
   */
  private insertSpacesInClosingTags(xml: string): string {
    return xml.replace(/\/>/g, " />");
  }

  /**
   * Format the xml with the configured line endings
   * @param xml - the xml to format
   * @returns - the formatted xml
   */
  private formatXmlLineEndings(xml: string): string {
    const lineEndings = workspace
      .getConfiguration(ConfigKey.Extension)
      .get(ConfigKey.LineEnding) as string;

    switch (lineEndings) {
      case LineEnding.Auto:
        return xml.replace(/\n/g, os.EOL);
      case LineEnding.LF:
        return xml.replace(/\r\n/g, "\n");
      case LineEnding.CRLF:
        return xml.replace(/\n/g, "\r\n");
      default:
        throw new Error(
          `Error parsing ${ConfigKey.LineEnding} extension setting`,
        );
    }
  }
}
