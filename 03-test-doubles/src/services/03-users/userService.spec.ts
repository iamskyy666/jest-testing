import { DatabaseService } from "./DatabaseService";
import { NewsletterService } from "./NewsletterService";
import { UserService } from "./UserService";

describe("UserService Test", () => {
  const successResp = {
    msg: "user registered successfully",
  };

  const errorResp = {
    msg: "failed to register user",
  };

  const mockName = "Skyy Banerjee";
  const mockEmail = "test@test.com";

  const mockUser = {
    id: 1,
    name: mockName,
    email: mockEmail,
    role: "user",
  };

  let createUserSpy: jest.SpyInstance;
  let subscribeUserSpy: jest.SpyInstance;

  beforeEach(() => {
    createUserSpy = jest.spyOn(DatabaseService, "createUser");
    subscribeUserSpy = jest.spyOn(NewsletterService, "subscribeUser");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should successfully register User and return success message", async () => {
    const userService = new UserService(mockName, mockEmail);

    createUserSpy.mockResolvedValue(mockUser);
    subscribeUserSpy.mockResolvedValue({ msg: "success" });

    const result = await userService.registerUser();

    expect(createUserSpy).toHaveBeenCalledWith(mockName, mockEmail);

    expect(subscribeUserSpy).toHaveBeenCalledWith(mockUser);

    expect(result).toStrictEqual(successResp);
  });

  //! Simulating ERRORs with jest.spyOn() in Jest Tests
  it("should return error message if name is not provided", async () => {
    const invalidInput = {
      name: "",
      email: mockEmail,
    };

    const userService = new UserService(invalidInput.name, invalidInput.email);

    createUserSpy.mockRejectedValue("Name is required");

    const result = await userService.registerUser();

    expect(createUserSpy).toHaveBeenCalledWith(
      invalidInput.name,
      invalidInput.email,
    );

    expect(subscribeUserSpy).not.toHaveBeenCalled();

    expect(result).toStrictEqual(errorResp);
  });

  it("should return error message if email is not test@test.com", async () => {
    const invalidInput = {
      name: mockName,
      email: "invalid@email.com",
    };

    const invalidUser = {
      id: 1,
      name: invalidInput.name,
      email: invalidInput.email,
      role: "user",
    };

    const userService = new UserService(invalidInput.name, invalidInput.email);

    createUserSpy.mockResolvedValue(invalidUser);
    subscribeUserSpy.mockImplementation(() => {
      return Promise.reject("Email is invalid!");
    });

    const result = await userService.registerUser();

    expect(createUserSpy).toHaveBeenCalledWith(
      invalidInput.name,
      invalidInput.email,
    );

    expect(subscribeUserSpy).toHaveBeenCalledWith(invalidUser);

    expect(result).toStrictEqual(errorResp);
  });
});

/*
$ npm test -- userService

> 03-test-doubles@1.0.0 test
> jest userService

  console.error
    Name is required

      at UserService.registerUser (src/services/03-users/C:/Users/ASUS/Desktop/jest-testing/03-test-doubles/src/services/03-users/UserService.ts:15:15)
      at Object.<anonymous> (src/services/03-users/C:/Users/ASUS/Desktop/jest-testing/03-test-doubles/src/services/03-users/userService.spec.ts:62:20)

  console.error
    Email is invalid!
      at UserService.registerUser (src/services/03-users/C:/Users/ASUS/Desktop/jest-testing/03-test-doubles/src/services/03-users/UserService.ts:15:15)
      at Object.<anonymous> (src/services/03-users/C:/Users/ASUS/Desktop/jest-testing/03-test-doubles/src/services/03-users/userService.spec.ts:94:20)

 PASS  src/services/03-users/userService.spec.ts
  UserService Test
    √ should successfully register User and return success message (6 ms)
    √ should return error message if name is not provided (42 ms)
    √ should return error message if email is not test@test.com (5 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.735 s, estimated 1 s
Ran all test suites matching userService.
*/