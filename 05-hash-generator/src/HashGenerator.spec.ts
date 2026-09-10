import { HashGenerator } from "./HashGenerator";

describe("hashGenerator", () => {
  const testSalt = "testSalt123";
  const differentSalt = "differentSalt123";
  const randInput = "randomInput123";

  it("should create a new instance with hash-salt", () => {
    const hashGenerator = HashGenerator.createHashGenerator(testSalt);

    expect(hashGenerator).toBeDefined();
    expect(hashGenerator).toBeInstanceOf(HashGenerator);
  });

  it("should create different instances when called multiple times", () => {
    const hashGenerator1 = HashGenerator.createHashGenerator(testSalt);
    const hashGenerator2 = HashGenerator.createHashGenerator(testSalt);

    expect(hashGenerator1).not.toBe(hashGenerator2);
  });

  it("should generate URL-safe hashes", () => {
    const hashGenerator = HashGenerator.createHashGenerator(testSalt);
    const hash = hashGenerator.generateHash(randInput);
    expect(hash).not.toMatch(/[+/=]/);
  });

  it("should generate different hashes for different inputs", () => {
    const hashGenerator = HashGenerator.createHashGenerator(testSalt);
    const differentInput = "differentInput123";
    const hash1 = hashGenerator.generateHash(randInput);
    const hash2 = hashGenerator.generateHash(differentInput);

    expect(hash1).not.toBe(hash2);
  });

  test("should generate different hashes with different secrets", () => {
    const hashGenerator1 = HashGenerator.createHashGenerator(testSalt);
    const hashGenerator2 = HashGenerator.createHashGenerator(differentSalt);

    const hash1 = hashGenerator1.generateHash(randInput);
    const hash2 = hashGenerator2.generateHash(randInput);

    expect(hash1).not.toBe(hash2);
  });

  test("should handle empty input", () => {
    const hashGenerator = HashGenerator.createHashGenerator(testSalt);
    const emptyInput = "";

    expect(() => hashGenerator.generateHash(emptyInput)).not.toThrow();
  });
});

/*
$ npm run test:cov

> 05-hash-generator@1.0.0 test:cov
> jest --coverage

 PASS  src/HashGenerator.spec.ts
  hashGenerator
    √ should create a new instance with hash-salt (3 ms)
    √ should create different instances when called multiple times (1 ms)
    √ should generate URL-safe hashes (2 ms)
    √ should generate different hashes for different inputs (1 ms)
    √ should generate different hashes with different secrets (1 ms)
    √ should handle empty input

------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------|---------|----------|---------|---------|-------------------
All files         |     100 |      100 |     100 |     100 |                   
 HashGenerator.ts |     100 |      100 |     100 |     100 |                   
------------------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.755 s, estimated 1 s
Ran all test suites.
*/