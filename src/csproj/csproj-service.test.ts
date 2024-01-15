import assert from "assert";
import CsprojService from "./csproj-service";
import { workspace } from "vscode";
import path from "path";

suite("CsprojService", () => {
  test("findNearestCsproj project-1 same dir", async () => {
    const workspaceRoot = workspace.workspaceFolders![0].uri.fsPath;
    const csprojService = new CsprojService();

    const nearest = await csprojService.findNearestCsproj(
      path.join(workspaceRoot, "project-1/fake.cs"),
    );

    assert.strictEqual(
      nearest,
      path.join(workspaceRoot, "project-1/project-1.csproj"),
    );
  });
});
