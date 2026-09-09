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
});

/*
$ npm test -- UserService

> 04-error-handling@1.0.0 test
> jest UserService

 PASS  src/services/01-users/UserService.spec.ts
  UserService
    √ should successfully register user and return a success-message (6 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.152 s
Ran all test suites matching UserService.
*/