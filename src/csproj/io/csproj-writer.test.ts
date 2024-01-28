import assert from "assert";
import CsprojInclude from "../meta/csproj-include";
import { CsprojIncludeType } from "../meta/csproj-include-type";
import CsprojWriter from "./csproj-writer";

suite("csproj-writer", () => {
  test("addInsertToCsproj compile statement", async () => {
    const csprojWriter = new CsprojWriter();

    const csproj = [
      {
        ":@": {},
        Project: [{ ItemGroup: [] }, { ItemGroup: [] }],
      },
    ];

    await csprojWriter.addIncludeToCsproj(
      new CsprojInclude("test.cs", CsprojIncludeType.Compile),
      csproj,
    );

    assert.equal(
      csproj[0].Project[1].ItemGroup.filter((item) => !!(item as any).Compile)
        .length,
      1,
    );
    assert.equal(
      csproj[0].Project[1].ItemGroup.find((item) => !!(item as any).Compile)![
        ":@"
      ]["@_Include"],
      "test.cs",
    );
  });

  test("addInsertToCsproj content statement", async () => {
    const csprojWriter = new CsprojWriter();

    const csproj = [
      {
        ":@": {},
        Project: [{ ItemGroup: [] }, { ItemGroup: [] }],
      },
    ];

    await csprojWriter.addIncludeToCsproj(
      new CsprojInclude("test.cshtml", CsprojIncludeType.Content),
      csproj,
    );

    assert.equal(
      csproj[0].Project[1].ItemGroup.filter((item) => !!(item as any).Content)
        .length,
      1,
    );
    assert.equal(
      csproj[0].Project[1].ItemGroup.find((item) => !!(item as any).Content)![
        ":@"
      ]["@_Include"],
      "test.cshtml",
    );
  });

  test("addInsertToCsproj should do nothing if csproj already contains include", () => {
    const csprojWriter = new CsprojWriter();

    const csproj = [
      {
        ":@": {},
        Project: [
          {
            ItemGroup: [
              {
                ":@": {
                  "@_Include": "foo.cshtml",
                },
                Content: [],
              },
            ],
          },
          { ItemGroup: [] },
        ],
      },
    ];

    csprojWriter.addIncludeToCsproj(
      new CsprojInclude("foo.cshtml", CsprojIncludeType.Content),
      csproj,
    );

    assert.equal(
      csproj[0].Project[0].ItemGroup.length,
      1,
      "should not add a new item",
    );
    assert.equal(
      csproj[0].Project[0].ItemGroup[0][":@"]["@_Include"],
      "foo.cshtml",
      "should not change the existing item",
    );
  });

  test("addInsertToCsproj compile statement with multiple item groups", () => {
    const csprojWriter = new CsprojWriter();

    const csproj = [
      {
        ":@": {},
        Project: [
          {
            ItemGroup: [
              {
                ":@": {
                  "@_Include": "foo.cs",
                },
                Compile: [],
              },
              {
                ":@": {
                  "@_Include": "bar.cs",
                },
                Compile: [],
              },
            ],
          },
          {
            ItemGroup: [],
          },
        ],
      },
    ];

    csprojWriter.addIncludeToCsproj(
      new CsprojInclude("test.cs", CsprojIncludeType.Compile),
      csproj,
    );

    // should add to the biggest compile group (the first one)
    assert.equal(
      csproj[0].Project[0].ItemGroup.filter((item: any) => !item["#text"])
        .length,
      3,
    );
    assert.equal(csproj[0].Project[1].ItemGroup.length, 0);
    assert.equal(
      csproj[0].Project[0].ItemGroup[0][":@"]["@_Include"],
      "foo.cs",
      "existing items should be preserved",
    );
    assert.equal(
      csproj[0].Project[0].ItemGroup[3][":@"]["@_Include"],
      "test.cs",
      "new item should be added to the end of the biggest group",
    );
  });

  test("addInsertToCsproj content statement with multiple item groups", () => {
    const csprojWriter = new CsprojWriter();

    const csproj = [
      {
        ":@": {},
        Project: [
          {
            ItemGroup: [
              {
                ":@": {
                  "@_Include": "foo.cs",
                },
                Compile: [],
              },
              {
                ":@": {
                  "@_Include": "bar.cs",
                },
                Compile: [],
              },
            ],
          },
          {
            ItemGroup: [
              {
                ":@": {
                  "@_Include": "baz.cshtml",
                },
                Content: [],
              },
            ],
          },
        ],
      },
    ];

    csprojWriter.addIncludeToCsproj(
      new CsprojInclude("o-ya.cshtml", CsprojIncludeType.Content),
      csproj,
    );

    // should add to the biggest content group (the second one)
    assert.equal(
      csproj[0].Project[0].ItemGroup.filter((item: any) => !!item.Content)
        .length,
      0,
    );
    assert.equal(
      csproj[0].Project[1].ItemGroup.filter((item: any) => !!item.Content)
        .length,
      2,
    );
    assert.equal(
      csproj[0].Project[1].ItemGroup[0][":@"]["@_Include"],
      "baz.cshtml",
      "existing items should be preserved",
    );
    assert.equal(
      csproj[0].Project[1].ItemGroup[2][":@"]["@_Include"],
      "o-ya.cshtml",
      "new item should be added to the end of the biggest group",
    );
  });

  test("removeInsertFromCsproj one item", () => {
    const csprojWriter = new CsprojWriter();

    const csproj = [
      {
        ":@": {},
        Project: [
          {
            ItemGroup: [
              {
                ":@": {
                  "@_Include": "foo.cshtml",
                },
                Content: [],
              },
            ],
          },
          { ItemGroup: [] },
        ],
      },
    ];

    csprojWriter.removeInsertFromCsproj(
      new CsprojInclude("foo.cshtml", CsprojIncludeType.Content),
      csproj,
    );

    assert.equal(
      csproj[0].Project[0].ItemGroup.length,
      0,
      "should delete item",
    );
  });

  test("removeInsertFromCsproj one item", () => {
    const csprojWriter = new CsprojWriter();

    const csproj = [
      {
        ":@": {},
        Project: [
          {
            ItemGroup: [
              {
                ":@": {
                  "@_Include": "foo.cshtml",
                },
                Content: [],
              },
              {
                ":@": {
                  "@_Include": "bar.cs",
                },
                Compile: [],
              },
              {
                ":@": {
                  "@_Include": "baz.cs",
                },
                Compile: [],
              },
            ],
          },
          { ItemGroup: [] },
        ],
      },
    ];

    csprojWriter.removeInsertFromCsproj(
      new CsprojInclude("bar.cs", CsprojIncludeType.Compile),
      csproj,
    );

    assert.equal(
      csproj[0].Project[0].ItemGroup.length,
      2,
      "should delete item",
    );
    assert.equal(
      csproj[0].Project[0].ItemGroup[0][":@"]["@_Include"],
      "foo.cshtml",
      "should not delete the wrong item",
    );
    assert.equal(
      csproj[0].Project[0].ItemGroup[1][":@"]["@_Include"],
      "baz.cs",
      "should not delete the wrong item",
    );
  });
});
