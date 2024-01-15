import assert from "assert";
import CsprojInclude from "../meta/csproj-include";
import { CsprojIncludeType } from "../meta/csproj-include-type";
import CsprojWriter from "./csproj-writer";

suite("csproj-writer", () => {
  test("addInsertToCsproj compile statement", async () => {
    const csprojWriter = new CsprojWriter();

    const csproj = {
      Project: {
        PropertyGroup: [],
        ItemGroup: [
          {
            Content: [],
            Compile: [],
          },
        ],
      },
    };

    await csprojWriter.addInsertToCsproj(
      new CsprojInclude("test.cs", CsprojIncludeType.Compile),
      csproj,
    );

    assert.equal(csproj.Project.ItemGroup[0].Compile.length, 1);
    assert.equal(
      csproj.Project.ItemGroup[0].Compile[0]["@_Include"],
      "test.cs",
    );
  });

  test("addInsertToCsproj content statement", async () => {
    const csprojWriter = new CsprojWriter();

    const csproj = {
      Project: {
        PropertyGroup: [],
        ItemGroup: [
          {
            Content: [],
            Compile: [],
          },
        ],
      },
    };

    await csprojWriter.addInsertToCsproj(
      new CsprojInclude("test.cshtml", CsprojIncludeType.Content),
      csproj,
    );

    assert.equal(csproj.Project.ItemGroup[0].Content.length, 1);
    assert.equal(
      csproj.Project.ItemGroup[0].Content[0]["@_Include"],
      "test.cshtml",
    );
  });

  test("addInsertToCsproj should do nothing if csproj already contains include", () => {
    const csprojWriter = new CsprojWriter();

    const csproj = {
      Project: {
        PropertyGroup: [],
        ItemGroup: [
          {
            Content: [
              {
                "@_Include": "foo.cshtml",
              },
            ],
            Compile: [],
          },
        ],
      },
    };

    csprojWriter.addInsertToCsproj(
      new CsprojInclude("foo.cshtml", CsprojIncludeType.Content),
      csproj,
    );

    assert.equal(
      csproj.Project.ItemGroup[0].Content.length,
      1,
      "should not add a new item",
    );
    assert.equal(
      csproj.Project.ItemGroup[0].Content[0]["@_Include"],
      "foo.cshtml",
      "should not modify existing items",
    );
  });

  test("addInsertToCsproj compile statement with multiple item groups", () => {
    const csprojWriter = new CsprojWriter();

    const csproj = {
      Project: {
        PropertyGroup: [],
        ItemGroup: [
          {
            Content: [
              {
                "@_Include": "foo.cshtml",
              },
            ],
            Compile: [],
          },
          {
            Content: [],
            Compile: [
              {
                "@_Include": "bar.cs",
              },
            ],
          },
        ],
      },
    };

    csprojWriter.addInsertToCsproj(
      new CsprojInclude("test.cs", CsprojIncludeType.Compile),
      csproj,
    );

    // should add to the biggest compile group (the second one)
    assert.equal(csproj.Project.ItemGroup[0].Compile.length, 0);
    assert.equal(csproj.Project.ItemGroup[1].Compile.length, 2);
    assert.equal(
      csproj.Project.ItemGroup[1].Compile[0]["@_Include"],
      "bar.cs",
      "existing items should be preserved",
    );
    assert.equal(
      csproj.Project.ItemGroup[1].Compile[1]["@_Include"],
      "test.cs",
      "new item should be added to the end of the biggest group",
    );
  });

  test("addInsertToCsproj content statement with multiple item groups", () => {
    const csprojWriter = new CsprojWriter();

    const csproj = {
      Project: {
        PropertyGroup: [],
        ItemGroup: [
          {
            Content: [
              {
                "@_Include": "foo.cshtml",
              },
            ],
            Compile: [],
          },
          {
            Content: [],
            Compile: [
              {
                "@_Include": "bar.cs",
              },
            ],
          },
        ],
      },
    };

    csprojWriter.addInsertToCsproj(
      new CsprojInclude("test.cshtml", CsprojIncludeType.Content),
      csproj,
    );

    // should add to the biggest content group (the first one)
    assert.equal(csproj.Project.ItemGroup[0].Content.length, 2);
    assert.equal(csproj.Project.ItemGroup[1].Content.length, 0);
    assert.equal(
      csproj.Project.ItemGroup[0].Content[0]["@_Include"],
      "foo.cshtml",
      "existing items should be preserved",
    );
    assert.equal(
      csproj.Project.ItemGroup[0].Content[1]["@_Include"],
      "test.cshtml",
      "new item should be added to the end of the biggest group",
    );
  });
});
