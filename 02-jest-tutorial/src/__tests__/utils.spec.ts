import {
  add,
  subtract,
  isEven,
  createUser,
  createJwtToken,
  calculateAverage,
} from "../utils";

describe("Utility Functions", () => {
  //! test add()
  it("should add two numbers correctly", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("should handle add-negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  //! test subtract()
  it("should subtract two numbers correctly", () => {
    expect(subtract(5, 2)).toBe(3);
  });

  it("should handle subtract-negative numbers", () => {
    expect(subtract(-1, -2)).toBe(1);
  });

  //! test isEven()
  it("returns true for even numbers", () => {
    expect(isEven(4)).toBe(true);
    expect(isEven(0)).toBe(true);
    expect(isEven(-8)).toBe(true);
    expect(isEven(66)).toBe(true);
  });

  it("returns false for odd numbers", () => {
    expect(isEven(3)).toBe(false);
    expect(isEven(-5)).toBe(false);
    expect(isEven(33)).toBe(false);
  });

  //! test createUser()
  it("creates user obj{} with correct properties", () => {
    const user1 = createUser("Skyy", 30);
    const user2 = createUser("Soumadip", 69);
    expect(user1).toStrictEqual({ name: "Skyy", age: 30 });
    expect(user2).toStrictEqual({
      name: "Soumadip",
      age: 69,
    });
    expect(user2).not.toStrictEqual({
      name: "Mia Khalifa",
      age: 404,
    });
  });

  //! test createJwtToken()
  it("should create a jwt token", async () => {
    const token = await createJwtToken();
    expect(token).toBe("jwt_token");
  });

  //! test calculateAverage()
  it("calculate avg. correctly for non-empty arrays", () => {
    expect(calculateAverage([2, 4, 6, 8])).toBe(5);
    expect(calculateAverage([10])).toBe(10);
  });

  it("calculate avg. correctly for empty arrays", () => {
    expect(calculateAverage([])).toBe(0);
  });
});

// -----------------------------------------------------

/*
$ npm test -- utils

> 02-jest-tutorial@1.0.0 test
> jest utils

 PASS  src/__tests__/utils.spec.ts
  Utility Functions
    √ should add two numbers correctly (3 ms)
    √ should handle negative numbers (1 ms)
    √ should subtract two numbers correctly
    √ should handle negative numbers
    √ returns true for even numbers
    √ returns false for odd numbers (1 ms)
    √ creates user obj{} with correct properties (1 ms)
    √ should create a jwt token (1 ms)
    √ calculate avg. correctly for non-empty arrays (1 ms)
    √ calculate avg. correctly for empty arrays

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        2.492 s, estimated 3 s
Ran all test suites matching utils.
*/

// ----------------------------------------------------------
