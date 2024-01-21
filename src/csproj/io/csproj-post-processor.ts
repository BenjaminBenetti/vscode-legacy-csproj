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
   * @param lineEndings - the line endings to use
   * @param applyCompatTransforms - whether or not to apply visual studio compatibility transforms
   * @returns - the processed csproj
   */
  public process(
    csproj: string,
    lineEndings: LineEnding,
    applyCompatTransforms: boolean = false,
    emptyTagExpansions: string[] = [],
  ): string {
    let formattedCsproj = this.expandEmptyTags(csproj, emptyTagExpansions);

    if (applyCompatTransforms) {
      formattedCsproj = this.unescape(formattedCsproj);
      formattedCsproj = this.insertSpacesInClosingTags(formattedCsproj);
      formattedCsproj = this.insertTheBOM(formattedCsproj);
    }

    formattedCsproj = this.formatXmlLineEndings(formattedCsproj, lineEndings);

    return formattedCsproj;
  }

  // ========================================================
  // private methods
  // ========================================================

  /**
   * Expand select empty tags as indicated
   * @param xml - the xml to expand empty tags in
   * @param tagsToExpand - the tags to expand
   * @returns - the xml with the empty tags expanded
   */
  private expandEmptyTags(xml: string, tagsToExpand: string[]): string {
    tagsToExpand
      .map((tag) => tag.trim())
      .forEach((tag) => {
        const regex = new RegExp(`(\\s*)<${tag}([^/]*)/>`, "g");
        xml = xml.replace(regex, `$1<${tag}$2>$1</${tag}>`);
      });

    // '<foo bar="baz" />'.replace(/<foo([^\/]*)\/>/, '<foo $1> </foo>');
    return xml;
  }

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
    return xml.replace(/([^\s])\/>/g, "$1 />");
  }

  /**
   * Format the xml with the configured line endings
   * @param xml - the xml to format
   * @param lineEndings - the line endings to apply
   * @returns - the formatted xml
   */
  private formatXmlLineEndings(xml: string, lineEndings: LineEnding): string {
    switch (lineEndings) {
      case LineEnding.Auto:
        return xml.replace(/\r*\n/g, os.EOL);
      case LineEnding.LF:
        return xml.replace(/\r*\n/g, "\n");
      case LineEnding.CRLF:
        return xml.replace(/\r*\n/g, "\r\n");
      default:
        throw new Error(
          `Error parsing ${ConfigKey.LineEnding} extension setting`,
        );
    }
  }
}
