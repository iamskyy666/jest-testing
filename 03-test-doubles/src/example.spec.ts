const user = {
  saveProfile: (name: string) => {
    return `saved-${name}`;
  },

  getRole: (userId: number) => {
    if (userId > 10) {
      return "guest";
    }
    return "admin";
  },

  fetchUserData: async (userId: number) => {
    // imagine this calls an API
    return { id: userId, name: "John" };
  },
};

// ------------------------------------- 🧪

//! Spy using jest.spyOn()
describe("spy mocking examples", () => {
  it("uses mockReturnValue for sync functions", () => {
    jest.spyOn(user, "getRole").mockReturnValue("guest");
    const result = user.getRole(9);
    // expect(result).toBe("admin"); ❌ FAILS!
    expect(result).toBe("guest");
  });

  // mock/spy async f(x) - jest.mockResolvedValue()
  it("uses mockResolvedValue for async functions ", async () => {
    const dummyUser = { id: 69, name: "Mocked User - Skyy" };
    jest.spyOn(user, "fetchUserData").mockResolvedValue(dummyUser); // overriding

    const result = await user.fetchUserData(34);
    expect(result).toStrictEqual(dummyUser);
  });

  // complex logic - jest.mockImplementation()
  // modify the behaviour - most powerful
  it("uses mockImplementation for complex logic", () => {
    jest.spyOn(user, "saveProfile").mockImplementation((name: string) => {
      if (!name) {
        throw new Error(`🔴Name is required!`);
      }
      return `saved-${name}`;
    });
    expect(() => user.saveProfile("")).toThrow("🔴Name is required!");
  });
});


//! ---------------------------------------------------------
/*
$ npm test -- example

> 03-test-doubles@1.0.0 test
> jest example

 PASS  src/example.spec.ts
  spy mocking examples
    √ uses mockReturnValue for sync functions (3 ms)
    √ uses mockResolvedValue for async functions  (2 ms)
    √ uses mockImplementation for complex logic (24 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.732 s, estimated 1 s
Ran all test suites matching example.
*/
//! ---------------------------------------------------------
