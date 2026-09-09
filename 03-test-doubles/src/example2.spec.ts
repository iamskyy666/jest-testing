import fs from "node:fs";

jest.mock("fs");

describe("mock node-modules", () => {
  it("should mock file reading", () => {
    const mockContent = "dummy file content";
    (fs.readFileSync as jest.Mock).mockReturnValue(mockContent);

    const content = fs.readFileSync("test.txt", "utf-8");
    expect(content).toBe(mockContent);
  });

  // Another approach
  it("should mock file reading 2", () => {
    const mockContent2 = "dummy file content 2";
    const fsSpy = jest.spyOn(fs, "readFileSync").mockReturnValue(mockContent2);

    const content2 = fs.readFileSync("test2.txt", "utf-8");

    expect(content2).toBe(mockContent2);

    fsSpy.mockRestore();
  });
});

/*
$ npm test -- example2

> 03-test-doubles@1.0.0 test
> jest example2

 PASS  src/example2.spec.ts
  mock node-modules
    √ should mock file reading (4 ms)
    √ should mock file reading 2 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.673 s, estimated 1 s
Ran all test suites matching example2.
*/