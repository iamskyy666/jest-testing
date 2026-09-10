import { DatabaseService } from "./DatabaseService";
import { NewsletterService } from "./NewsletterService";
import { UserService } from "./UserService";

describe("UserService", () => {
  const successResponse = { msg: "user registered successfully" };
  const mockName = "John";
  const mockEmail = "test@test.com";

  const mockUser = {
    id: 1,
    name: mockName,
    email: mockEmail,
    role: "user",
  };

  // instances
  let createUserSpy: jest.SpyInstance;
  let subscribeUserSpy: jest.SpyInstance;

  beforeEach(() => {
    createUserSpy = jest.spyOn(DatabaseService, "createUser");
    subscribeUserSpy = jest.spyOn(NewsletterService, "subscribeUser");
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // test cases
  test("should successfully register user and return a success-message", async () => {
    const userService = new UserService(mockName, mockEmail);
    createUserSpy.mockResolvedValue(mockUser);
    subscribeUserSpy.mockResolvedValue({ msg: "success" });
    const result = await userService.registerUser();
    expect(createUserSpy).toHaveBeenCalledWith(mockName, mockEmail);
    expect(subscribeUserSpy).toHaveBeenCalledWith(mockUser);

    expect(result).toEqual(successResponse);
  });

  // Exploring testing strategies - Error handling 💡
  // first sync-code errors
  test("should throw an error-message if name is not provided", async () => {
    const invalidInput = { name: "", email: mockEmail };
    const userService = new UserService(invalidInput.name, invalidInput.email);
    createUserSpy.mockImplementation(() => {
      return Promise.reject("Name is required");
    });

    // expect(() => userService.registerUser()).toThrow(); // will fail because registerUser( ) is async

    // For async() -
    await expect(() => userService.registerUser()).rejects.toThrow();
    await expect(() => userService.registerUser()).rejects.toThrow(
      "User registration failed",
    );

    // Another approach try/catch
    try {
      await userService.registerUser();
      fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("User registration failed");
    }
  });
});

/*
$ npm test -- UserService

> 04-error-handling@1.0.0 test
> jest UserService

 PASS  src/services/01-users/UserService.spec.ts
  UserService
    √ should successfully register user and return a success-message (5 ms)
    √ should throw an error-message if name is not provided (17 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.711 s, estimated 1 s
Ran all test suites matching UserService.
*/
