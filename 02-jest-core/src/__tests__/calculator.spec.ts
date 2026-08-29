import Calculator from "../Calculator";

describe("Calculator Class Testing", () => {
  let calc: Calculator; // SUT
  beforeEach(() => {
    console.log(`beforeEach() test.. ✅`);
    calc= new Calculator()
  });

  afterAll(() => {
    console.log(`afterAll() tests.. ☑️`);
  });
  // const calc = new Calculator();
  it("calc should start with value 0", () => {
    expect(calc.value).toBe(0);
  });

  it("calc add-method should add to the curr. value", () => {
    expect(calc.add(2)).toBe(2);
    expect(calc.add(4)).toBe(6);
    expect(calc.add(-1)).toBe(5);
  });

  it("calc subtract-method should subtract from the curr. value", () => {
    expect(calc.subtract(2)).toBe(-2);
    expect(calc.subtract(-4)).toBe(2);
  });

  it("calc isPositive-method should return true if curr. value is positive", () => {
    calc.add(10)
    expect(calc.isPositive()).not.toBeFalsy();
    expect(calc.isPositive()).toBeTruthy();
  });

  it("calc isPositive-method should return false if curr. value is negative", () => {
    calc.subtract(50); // make the current val. less than 0
    expect(calc.isPositive()).toBeFalsy();
    expect(calc.isPositive()).not.toBeTruthy();
  });
});

// ---------------------------------
/*
$ npm test -- calculator

> 02-jest-tutorial@1.0.0 test
> jest calculator

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    afterAll() tests.. ☑️

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:11:13)

 PASS  src/__tests__/calculator.spec.ts
  Calculator Class Testing
    √ calc should start with value 0 (29 ms)
    √ calc add-method should add to the curr. value (2 ms)
    √ calc subtract-method should subtract from the curr. value (3 ms)
    √ calc isPositive-method should return true if curr. value is positive (3 ms)
    √ calc isPositive-method should return false if curr. value is negative (4 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        2.604 s, estimated 3 s
Ran all test suites matching calculator.
*/
// ---------------------------------
