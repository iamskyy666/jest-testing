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

//! Clearing and resetting mocks in JEST
describe("user role test", () => {
  let roleSpy: jest.SpyInstance;

  beforeEach(() => {
    roleSpy = jest.spyOn(user, "getRole");
  });

  afterEach(()=>{
    jest.restoreAllMocks()
  })

  it("should return mocked guest role", () => {
    roleSpy.mockReturnValue("guest");
    const result = user.getRole(2);
    expect(result).toBe("guest");
  });
  it("should return the original implementation", () => {
    const result = user.getRole(2);
    expect(result).toBe("admin");
    expect(roleSpy).toHaveBeenCalledTimes(1) // confirm
  });
});

//! ---------------------------------------------------------
/*
$ npm test -- example

> 03-test-doubles@1.0.0 test
> jest example

 PASS  src/example.spec.ts
  user role test
    √ should return mocked guest role (4 ms)
    √ should return the original implementation (2 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.802 s, estimated 1 s
Ran all test suites matching example.

*/
//! ---------------------------------------------------------
