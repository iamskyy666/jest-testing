import { DatabaseService } from "./DatabaseService";
import { NewsletterService } from "./NewsletterService";
import { UserService } from "./UserService";

// EXTRA IMPORTS (for custom error handling)
import { AppCodes } from "../../utils/AppCodes";
import { CustomError } from "../../utils/CustomError";
import { HttpCodes } from "../../utils/HttpCodes";

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
    expect(createUserSpy).toHaveBeenCalledWith(
      mockName,
      mockEmail,
    );

    expect(subscribeUserSpy).toHaveBeenCalledWith(
      mockUser,
    );

    expect(result).toEqual(successResponse);
  });

  // --------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------

  test("should throw CustomError when user registration fails", async () => {
    // Arrange
    const userService = new UserService(
      mockName,
      mockEmail,
    );

    createUserSpy.mockRejectedValue(
      new Error("Name is required"),
    );

    // Act + Assert
    await expect(
      userService.registerUser(),
    ).rejects.toBeInstanceOf(CustomError);
  });

  // --------------------------------------------------
  // CUSTOM ERROR DETAILS
  // --------------------------------------------------

  test("should call CustomError.throwError with the correct error details", async () => {
    // Arrange
    const userService = new UserService(
      mockName,
      mockEmail,
    );

    createUserSpy.mockRejectedValue(
      new Error("Name is required"),
    );

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
});

/*
$ npm test -- UserService

> 04-error-handling@1.0.0 test
> jest UserService

  console.log
    [INFO] [UserService registerUser] REGISTER_USER_SUCCESS {
      "user": {
        "id": 1,
        "name": "John",
        "email": "test@test.com",
        "role": "user"
      }
    }

      at CustomLogger.info (src/utils/C:/Users/ASUS/Desktop/jest-testing/04-testing-errors/src/utils/CustomLogger.ts:10:13)

  console.log
    [ERROR] [CustomError.throwError] REGISTER_USER_FAILED {
      "message": "failed to register user",
      "httpCode": 500,
      "stack": "CustomError: failed to register user\n    at CustomError.throwError (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\utils\\C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\utils\\CustomError.ts:22:19)\n    at CustomError.<anonymous> (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\node_modules\\jest-mock\\build\\index.js:744:25)\n    at C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\node_modules\\jest-mock\\build\\index.js:374:39\n    at CustomError.<anonymous> (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\node_modules\\jest-mock\\build\\index.js:381:13)\n    at CustomError.mockConstructor (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\node_modules\\jest-mock\\build\\index.js:116:19)\n    at UserService.registerUser (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\services\\01-users\\C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\services\\01-users\\UserService.ts:34:19)\n    at Object.<anonymous> (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\services\\01-users\\C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\services\\01-users\\UserService.spec.ts:81:5)"
    }

      at CustomLogger.error (src/utils/C:/Users/ASUS/Desktop/jest-testing/04-testing-errors/src/utils/CustomLogger.ts:21:13)

  console.log
    [ERROR] [CustomError.throwError] REGISTER_USER_FAILED {
      "message": "failed to register user",
      "httpCode": 500,
      "stack": "CustomError: failed to register user\n    at CustomError.throwError (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\utils\\C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\utils\\CustomError.ts:22:19)\n    at CustomError.<anonymous> (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\node_modules\\jest-mock\\build\\index.js:744:25)\n    at C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\node_modules\\jest-mock\\build\\index.js:374:39\n    at CustomError.<anonymous> (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\node_modules\\jest-mock\\build\\index.js:381:13)\n    at CustomError.mockConstructor (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\node_modules\\jest-mock\\build\\index.js:116:19)\n    at UserService.registerUser (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\services\\01-users\\C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\services\\01-users\\UserService.ts:34:19)\n    at Object.<anonymous> (C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\services\\01-users\\C:\\Users\\ASUS\\Desktop\\jest-testing\\04-testing-errors\\src\\services\\01-users\\UserService.spec.ts:103:7)"
    }

      at CustomLogger.error (src/utils/C:/Users/ASUS/Desktop/jest-testing/04-testing-errors/src/utils/CustomLogger.ts:21:13)

 PASS  src/services/01-users/UserService.spec.ts
  UserService
    √ should successfully register user and return a success message (45 ms)
    √ should throw CustomError when user registration fails (93 ms)
    √ should call CustomError.throwError with the correct error details (7 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        1.056 s
Ran all test suites matching UserService.
*/