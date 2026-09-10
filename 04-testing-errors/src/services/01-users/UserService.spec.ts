import { DatabaseService, User } from "./DatabaseService";
import { NewsletterService } from "./NewsletterService";
import { UserService } from "./UserService";

// EXTRA IMPORTS (for custom error handling)
import { AppCodes } from "../../utils/AppCodes";
import { CustomError } from "../../utils/CustomError";
import { HttpCodes } from "../../utils/HttpCodes";
import { CustomLogger } from "../../utils/CustomLogger";

// MOCK CUSTOM-LOGGER
jest.mock("../../utils/CustomLogger"); // silence logs

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

  // Spy instances
  let createUserSpy: jest.SpyInstance;
  let subscribeUserSpy: jest.SpyInstance;
  let customErrSpy: jest.SpyInstance;

  beforeEach(() => {
    createUserSpy = jest.spyOn(DatabaseService, "createUser");
    subscribeUserSpy = jest.spyOn(NewsletterService, "subscribeUser");
    customErrSpy = jest.spyOn(CustomError, "throwError");
    CustomLogger.info = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --------------------------------------------------
  // SUCCESS
  // --------------------------------------------------

  test("should successfully register user and return a success message", async () => {
    // Arrange
    const userService = new UserService(mockName, mockEmail);

    createUserSpy.mockResolvedValue(mockUser);
    subscribeUserSpy.mockResolvedValue({ msg: "success" });

    // Act
    const result = await userService.registerUser();

    // Assert
    expect(createUserSpy).toHaveBeenCalledWith(mockName, mockEmail);

    expect(subscribeUserSpy).toHaveBeenCalledWith(mockUser);

    expect(result).toEqual(successResponse);
  });

  // --------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------

  test("should throw CustomError when user registration fails", async () => {
    // Arrange
    const userService = new UserService(mockName, mockEmail);

    createUserSpy.mockRejectedValue(new Error("Name is required"));

    // Act + Assert
    await expect(userService.registerUser()).rejects.toBeInstanceOf(
      CustomError,
    );
  });

  // --------------------------------------------------
  // CUSTOM ERROR DETAILS
  // --------------------------------------------------

  test("should call CustomError.throwError with the correct error details", async () => {
    // Arrange
    const userService = new UserService(mockName, mockEmail);

    createUserSpy.mockRejectedValue(new Error("Name is required"));

    // Act
    try {
      await userService.registerUser();
      fail("Should have thrown an error");
    } catch (error) {
      // Assert
      expect(customErrSpy).toHaveBeenCalledWith(
        HttpCodes.INTERNAL_SERVER_ERROR,
        AppCodes.REGISTER_USER_FAILED,
        "failed to register user",
      );
    }
  });

  // --------------------------------------------------
  // CATCHING ERRORS
  // --------------------------------------------------

  it("should return error message if name is not provided 2", async () => {
    const userService = new UserService(mockName, mockEmail);
    createUserSpy.mockResolvedValue(mockUser);
    subscribeUserSpy.mockResolvedValue({ msg: "success" });

    // Act
    try {
      await userService.registerUser();
      fail("Should have thrown an error"); // fail-safe
    } catch (error) {
      // Assert
      expect(error).toBeInstanceOf(CustomError);
      expect(customErrSpy).toHaveBeenCalledWith(
        HttpCodes.INTERNAL_SERVER_ERROR,
        AppCodes.REGISTER_USER_FAILED,
        "failed to register user",
      );
    }
  });
});

/*
ASUS@DESKTOP-PK42N06 MINGW64 ~/Desktop/jest-testing/04-testing-errors (main)

$ npm test -- UserService

> 04-error-handling@1.0.0 test
> jest UserService

 FAIL  src/services/01-users/UserService.spec.ts
  UserService
    √ should successfully register user and return a success message (5 ms)
    √ should throw CustomError when user registration fails (23 ms)
    √ should call CustomError.throwError with the correct error details (4 ms)
    × should return error message if name is not provided 2 (2 ms)

  ● UserService › should return error message if name is not provided 2

    expect(received).toBeInstanceOf(expected)

    Expected constructor: CustomError
    Received constructor: ReferenceError

      at Object.<anonymous> (src/services/01-users/C:/Users/ASUS/Desktop/jest-testing/04-testing-errors/src/services/01-users/UserService.spec.ts:120:21)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 3 passed, 4 total
Snapshots:   0 total
Time:        0.834 s, estimated 1 s
Ran all test suites matching UserService.

*/
