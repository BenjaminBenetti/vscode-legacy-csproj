import { workspace } from "vscode";
import * as assert from "assert";
import CsprojLocator from "./csproj-locator";
import path from "path";

suite("csproj-locator", () => {
  test("findNearestCsproj same dir", async () => {
    const csprojLocator = new CsprojLocator();
    const workspacePath = workspace.workspaceFolders![0].uri.fsPath;

    const result = await csprojLocator.findNearestCsproj(
      path.join(workspacePath, "project-1"),
      workspacePath,
    );

    assert.strictEqual(
      result,
      path.join(workspacePath, "project-1", "project-1.csproj"),
    );
  });

  test("findNearestCsproj sub dir", async () => {
    const csprojLocator = new CsprojLocator();
    const workspacePath = workspace.workspaceFolders![0].uri.fsPath;

    const result = await csprojLocator.findNearestCsproj(
      path.join(workspacePath, "project-1", "subdir"),
      workspacePath,
    );

    assert.strictEqual(
      result,
      path.join(workspacePath, "project-1", "project-1.csproj"),
    );
  });

  test("findNearestCsproj sub dir 2 levels", async () => {
    const csprojLocator = new CsprojLocator();
    const workspacePath = workspace.workspaceFolders![0].uri.fsPath;

    const result = await csprojLocator.findNearestCsproj(
      path.join(workspacePath, "project-1", "subdir", "going-deeper"),
      workspacePath,
    );

    assert.strictEqual(
      result,
      path.join(workspacePath, "project-1", "project-1.csproj"),
    );
  });

  test("findNearestCsproj sub dir that doesn't exist 3 levels", async () => {
    const csprojLocator = new CsprojLocator();
    const workspacePath = workspace.workspaceFolders![0].uri.fsPath;

    const result = await csprojLocator.findNearestCsproj(
      path.join(
        workspacePath,
        "project-1",
        "subdir",
        "going-deeper",
        "even-deeper",
      ),
      workspacePath,
    );

    assert.strictEqual(
      result,
      path.join(workspacePath, "project-1", "project-1.csproj"),
    );
  });

  test("findNearestCsproj no csproj", async () => {
    const csprojLocator = new CsprojLocator();
    const workspacePath = workspace.workspaceFolders![0].uri.fsPath;

    const result = await csprojLocator.findNearestCsproj(
      workspacePath,
      workspacePath,
    );

    assert.strictEqual(result, null);
  });
});
