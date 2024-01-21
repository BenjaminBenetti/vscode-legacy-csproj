import { workspace } from "vscode";
import fs from "fs";
import path from "path";
import CsprojPostProcessor from "./csproj-post-processor";
import assert from "assert";
import { LineEnding } from "../../config/line-ending";

suite("CsprojPostProcessor", () => {
  const workspacePath = workspace.workspaceFolders![0].uri.fsPath;

  test("process only line endings LF", () => {
    const csproj = fs
      .readFileSync(path.join(workspacePath, "project-1", "project-1.csproj"))
      .toString();

    const processedCsproj = new CsprojPostProcessor().process(
      csproj,
      LineEnding.LF,
    );

    assert.doesNotMatch(processedCsproj, /\r\n/);
  });

  test("process only line endings CRLF", () => {
    const csproj = fs
      .readFileSync(path.join(workspacePath, "project-2", "project-2.csproj"))
      .toString();

    const processedCsproj = new CsprojPostProcessor().process(
      csproj,
      LineEnding.CRLF,
    );

    assert.match(processedCsproj, /\r\n/);
  });

  test("process only line endings CRLF multiple times", () => {
    const csproj = fs
      .readFileSync(path.join(workspacePath, "project-1", "project-1.csproj"))
      .toString();

    let processedCsproj = new CsprojPostProcessor().process(
      csproj,
      LineEnding.CRLF,
    );
    processedCsproj = new CsprojPostProcessor().process(
      csproj,
      LineEnding.CRLF,
    );

    assert.match(processedCsproj, /\r\n/);
    assert.doesNotMatch(processedCsproj, /\r\r\n/);
  });

  test("process expand empty tags", () => {
    const csproj = fs
      .readFileSync(path.join(workspacePath, "project-2", "project-2.csproj"))
      .toString();

    const processedCsproj = new CsprojPostProcessor().process(
      csproj,
      LineEnding.CRLF,
      false,
      ["IISExpressAnonymousAuthentication", "UseGlobalApplicationHostFile"],
    );

    assert.match(
      processedCsproj,
      /<IISExpressAnonymousAuthentication\s*>.*<\/IISExpressAnonymousAuthentication>/s,
    );
    assert.match(
      processedCsproj,
      /<UseGlobalApplicationHostFile\s*>.*<\/UseGlobalApplicationHostFile>/s,
    );
  });

  test("process vs compat transforms", () => {
    const csproj = fs
      .readFileSync(path.join(workspacePath, "project-1", "project-1.csproj"))
      .toString();

    const processedCsproj = new CsprojPostProcessor().process(
      csproj,
      LineEnding.CRLF,
      true,
    );

    assert.match(processedCsproj, /<IISExpressSSLPort\s\/>/);
    assert.match(
      processedCsproj,
      /<Configuration\sCondition=" '\$\(Configuration\)' == '' ">(.*?)<\/Configuration>/s,
    );
    assert.match(processedCsproj, /\ufeff/);
  });
});
