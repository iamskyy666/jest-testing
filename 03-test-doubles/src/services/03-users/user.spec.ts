import { user } from "./user";

// jest.mock("./user");

jest.mock("./user", () => ({
  user: {
    getRole: jest.fn().mockReturnValue("guest"),
    getName: jest.fn().mockReturnValue("skyy"),
    getEmail: (): string => "skyy@example.com", // be careful , don't override
  },
}));
// console.log(user);

describe("user mocking approaches", () => {
  //   it("mocks single method using jest.fn() 1", () => {
  //     user.getRole = jest.fn().mockReturnValue("guest");
  //     expect(user.getRole()).toBe("guest");
  //     expect(user.getName()).toBe("John");
  //   });

  //! 2nd approach - Now with jest.mock()
  it("mocks single method using jest.fn() 2", () => {
    (user.getRole as jest.Mock).mockReturnValue("guest");
    expect(user.getRole()).toBe("guest");
    // expect(user.getName()).toBe('John') // ❌
  });

  //! 3rd approach - callBack()
  it("mocks single method using jest.fn() 3", () => {
    expect(user.getRole()).toBe("guest");
    expect(user.getName()).toBe("skyy");
  });
});

/*
$ npm test -- src/services/03-users/user.spec.ts

> 03-test-doubles@1.0.0 test
> jest src/services/03-users/user.spec.ts

 PASS  src/services/03-users/user.spec.ts
  user mocking approaches
    √ mocks single method using jest.fn() 2 (3 ms)
    √ mocks single method using jest.fn() 3 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.633 s, estimated 1 s
Ran all test suites matching src/services/03-users/user.spec.ts.
*/