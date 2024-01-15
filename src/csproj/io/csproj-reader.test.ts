import { workspace } from "vscode";
import CsprojReader from "./csproj-reader";
import path from "path";
import assert from "assert";
import { CsprojIncludeType } from "../meta/csproj-include-type";

suite("csproj-reader", () => {
  test("can read csproj project-1", async () => {
    const csprojReader = new CsprojReader();
    const workspacePath = workspace.workspaceFolders![0].uri.fsPath;

    const csprojMeta = await csprojReader.readCsproj(
      path.join(workspacePath, "project-1", "project-1.csproj"),
    );
    const contentIncludes = csprojMeta.includes.filter(
      (include) => include.type === CsprojIncludeType.Content,
    );
    const compileIncludes = csprojMeta.includes.filter(
      (include) => include.type === CsprojIncludeType.Compile,
    );

    assert.strictEqual(csprojMeta.toolVersion, 12);
    assert.strictEqual(csprojMeta.sdk, null);
    assert.strictEqual(csprojMeta.targetFramework, "v4.5.2");
    assert.equal(
      contentIncludes.length,
      57,
      "csproj contains 57 content statements",
    );
    assert.equal(contentIncludes[0].include, "App_Themes\\css\\app.css");
    assert.equal(
      compileIncludes.length,
      9,
      "csproj contains 9 compile statements",
    );
    assert.equal(
      compileIncludes[0].include,
      "App_Code\\BraintreeConfiguration.cs",
    );
  });

  test("can read csproj project-2", async () => {
    const csprojReader = new CsprojReader();
    const workspacePath = workspace.workspaceFolders![0].uri.fsPath;

    const csprojMeta = await csprojReader.readCsproj(
      path.join(workspacePath, "project-2", "project-2.csproj"),
    );
    const contentIncludes = csprojMeta.includes.filter(
      (include) => include.type === CsprojIncludeType.Content,
    );
    const compileIncludes = csprojMeta.includes.filter(
      (include) => include.type === CsprojIncludeType.Compile,
    );

    assert.strictEqual(csprojMeta.toolVersion, 14);
    assert.strictEqual(csprojMeta.sdk, null);
    assert.strictEqual(csprojMeta.targetFramework, "v4.8.1");
    assert.equal(
      contentIncludes.length,
      3,
      "csproj contains 3 content statements",
    );
    assert.equal(contentIncludes[0].include, "Global.asax");
    assert.equal(
      compileIncludes.length,
      19,
      "csproj contains 19 compile statements",
    );
    assert.equal(compileIncludes[0].include, "App_Start\\NinjectWebCommon.cs");
  });
});
