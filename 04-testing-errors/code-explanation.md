```ts 
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
```

---


This file is actually a **very good summary of several Jest concepts at once**: spies, mocks, async rejection, custom errors, lifecycle hooks, Arrange–Act–Assert, and module mocking.

There is also **one intentionally broken test at the bottom**, and understanding *why* it produces `ReferenceError` is important because it teaches us a subtle but very useful testing principle.

We’ll go through the file from top to bottom, then understand the final failure and what the test should actually look like.

---

# 1. What this test file is testing

Our production class is roughly:

```ts
UserService
    │
    ├── DatabaseService.createUser()
    │
    ├── NewsletterService.subscribeUser()
    │
    ├── CustomLogger.info()
    │
    └── CustomError.throwError()
```

So `UserService.registerUser()` has two possible paths:

```text
                 registerUser()
                      │
                      ▼
             DatabaseService
               createUser()
                      │
                ┌─────┴─────┐
                │           │
              success      failure
                │           │
                ▼           ▼
       NewsletterService   catch
        subscribeUser()       │
                │             ▼
                ▼       CustomError.throwError()
          CustomLogger.info()
                │
                ▼
             return
          success response
```

Our test file needs to verify both paths.

---

# 2. Imports

```ts
import { DatabaseService, User } from "./DatabaseService";
import { NewsletterService } from "./NewsletterService";
import { UserService } from "./UserService";
```

These imports bring the classes/functions we need into the test.

### `DatabaseService`

This is a dependency of `UserService`.

Our production code does:

```ts
const user = await DatabaseService.createUser(
  this.name,
  this.email,
);
```

Therefore, our test needs access to `DatabaseService` so that we can spy on `createUser()`.

---

### `NewsletterService`

Same idea.

Our production code does:

```ts
await NewsletterService.subscribeUser(user);
```

Therefore, we spy on:

```ts
NewsletterService.subscribeUser
```

---

### `UserService`

This is the **SUT**.

SUT means:

> **System Under Test**

In our test:

```ts
const userService = new UserService(...);
```

and then:

```ts
await userService.registerUser();
```

`UserService.registerUser()` is the thing whose behavior we're primarily testing.

---

## What about `User`?

```ts
import { DatabaseService, User } from "./DatabaseService";
```

In the current code, `User` isn't actually being used.

So we can remove it:

```ts
import { DatabaseService } from "./DatabaseService";
```

If TypeScript/ESLint complains about an unused import, that's why.

---

# 3. Custom-error imports

```ts
import { AppCodes } from "../../utils/AppCodes";
import { CustomError } from "../../utils/CustomError";
import { HttpCodes } from "../../utils/HttpCodes";
import { CustomLogger } from "../../utils/CustomLogger";
```

These correspond to our custom error system.

### `AppCodes`

Contains application-level error identifiers:

```ts
export enum AppCodes {
  REGISTER_USER_SUCCESS = "REGISTER_USER_SUCCESS",
  REGISTER_USER_FAILED = "REGISTER_USER_FAILED",
}
```

So our test can verify:

```ts
AppCodes.REGISTER_USER_FAILED
```

instead of hard-coding:

```ts
"REGISTER_USER_FAILED"
```

---

### `HttpCodes`

Contains HTTP status codes such as:

```ts
HttpCodes.INTERNAL_SERVER_ERROR
```

which represents:

```text
500
```

---

### `CustomError`

This is the actual custom error class.

Our production code eventually creates:

```ts
new CustomError(...)
```

and throws it.

Therefore we can test:

```ts
expect(error).toBeInstanceOf(CustomError);
```

---

### `CustomLogger`

Our production `UserService` logs successful registration:

```ts
CustomLogger.info(...)
```

and `CustomError` logs errors:

```ts
CustomLogger.error(...)
```

We don't really want our test terminal flooded with those logs.

That's why we're mocking the logger.

---

# 4. `jest.mock()` — mocking the entire logger module

```ts
jest.mock("../../utils/CustomLogger"); // silence logs
```

This is a **module mock**.

This is different from:

```ts
jest.fn()
```

and different from:

```ts
jest.spyOn()
```

Let's distinguish them clearly.

### `jest.fn()`

Creates a new mock function:

```ts
const mockFn = jest.fn();
```

There wasn't necessarily an existing function involved.

---

### `jest.spyOn()`

Takes an existing object's method and turns it into a spy/mock:

```ts
jest.spyOn(DatabaseService, "createUser");
```

We are saying:

> "Take this existing method and let us observe/control it."

---

### `jest.mock()`

Mocks a module:

```ts
jest.mock("../../utils/CustomLogger");
```

We are saying:

> "When this module is imported during this test, give us a mocked version of the module."

Conceptually:

```text
Real module
    ↓
CustomLogger
    ↓
jest.mock()
    ↓
Mocked module
```

This is particularly useful for things like:

* loggers
* HTTP clients
* database modules
* filesystem modules
* external APIs

where we don't want the real side effect happening during a unit test.

---

# 5. Test suite

```ts
describe("UserService", () => {
```

`describe()` creates a **test suite/group**.

Everything inside belongs to:

```text
UserService
```

So Jest reports:

```text
UserService
   ├── test 1
   ├── test 2
   ├── test 3
   └── test 4
```

---

# 6. Shared test data

```ts
const successResponse = {
  msg: "user registered successfully",
};
```

This is the expected successful result.

Our production method returns:

```ts
return {
  msg: "user registered successfully",
};
```

So instead of repeatedly writing the object, we store it once.

---

```ts
const mockName = "John";
const mockEmail = "test@test.com";
```

These are our test inputs.

They're not real database data.

They're **mock/test data**.

---

# 7. Mock user

```ts
const mockUser = {
  id: 1,
  name: mockName,
  email: mockEmail,
  role: "user",
};
```

This represents what we expect:

```ts
DatabaseService.createUser()
```

to return.

Production:

```text
DatabaseService
       │
       ▼
    User object
```

Test:

```text
createUserSpy
       │
       ▼
   mockUser
```

We're therefore replacing the real database operation with a predictable value.

---

# 8. Declaring our spies

```ts
let createUserSpy: jest.SpyInstance;
let subscribeUserSpy: jest.SpyInstance;
let customErrSpy: jest.SpyInstance;
```

These are variables that will hold our spies.

At this point, we're only **declaring** them.

We're not creating spies yet.

Think:

```text
let createUserSpy;
```

means:

> "We're going to have a spy called `createUserSpy`, but we'll create it later."

Why?

Because we want a fresh spy setup before each test.

---

# 9. `beforeEach()`

```ts
beforeEach(() => {
  createUserSpy = jest.spyOn(
    DatabaseService,
    "createUser",
  );

  subscribeUserSpy = jest.spyOn(
    NewsletterService,
    "subscribeUser",
  );

  customErrSpy = jest.spyOn(
    CustomError,
    "throwError",
  );

  CustomLogger.info = jest.fn();
});
```

This is one of the most important parts.

`beforeEach()` runs:

> **before every single test**

We have four tests, so this runs four times.

---

## First spy

```ts
createUserSpy = jest.spyOn(
  DatabaseService,
  "createUser",
);
```

Now:

```text
DatabaseService.createUser
          │
          ▼
      Jest Spy
          │
          ├── records calls
          ├── records arguments
          └── can replace behavior
```

We can now do:

```ts
createUserSpy.mockResolvedValue(mockUser);
```

or:

```ts
createUserSpy.mockRejectedValue(
  new Error("Database failed"),
);
```

---

## Second spy

```ts
subscribeUserSpy = jest.spyOn(
  NewsletterService,
  "subscribeUser",
);
```

Same concept.

We can control:

```ts
NewsletterService.subscribeUser()
```

without actually sending a newsletter.

---

## Third spy

```ts
customErrSpy = jest.spyOn(
  CustomError,
  "throwError",
);
```

Now we're observing:

```ts
CustomError.throwError()
```

This lets us later say:

```ts
expect(customErrSpy).toHaveBeenCalledWith(...)
```

---

# 10. Why are we spying on `CustomError.throwError()`?

This is an important distinction.

We have two possible things to test.

### Behavior

```ts
await expect(
  userService.registerUser()
).rejects.toBeInstanceOf(CustomError);
```

This asks:

> Did the service actually produce the correct error?

That's generally the more important test.

---

### Implementation detail

```ts
expect(customErrSpy).toHaveBeenCalledWith(
  HttpCodes.INTERNAL_SERVER_ERROR,
  AppCodes.REGISTER_USER_FAILED,
  "failed to register user",
);
```

This asks:

> Did `UserService` call our error helper with these exact arguments?

That's an implementation-level test.

It's still useful here because we're specifically learning/testing our custom error-handling mechanism.

---

# 11. Why `CustomLogger.info = jest.fn()`?

```ts
CustomLogger.info = jest.fn();
```

We're replacing the real logger method with a mock function.

Without mocking, our successful test causes:

```text
[INFO] [UserService registerUser] ...
```

to appear in the terminal.

That's not necessarily a test failure, but it's noisy.

With:

```ts
CustomLogger.info = jest.fn();
```

we effectively say:

> "For this test, don't execute the real logging behavior."

The call can still be tracked.

For example, we could later test:

```ts
expect(CustomLogger.info).toHaveBeenCalled();
```

---

# 12. `afterEach()`

```ts
afterEach(() => {
  jest.restoreAllMocks();
});
```

This runs **after every test**.

This is extremely important.

Our tests modify:

```text
DatabaseService.createUser
NewsletterService.subscribeUser
CustomError.throwError
CustomLogger.info
```

We don't want test #1's modifications leaking into test #2.

So:

```text
beforeEach
    ↓
create fresh spies/mocks
    ↓
run test
    ↓
afterEach
    ↓
restore original implementations
```

Then:

```text
beforeEach
    ↓
fresh setup
    ↓
test #2
    ↓
afterEach
```

This keeps tests isolated.

---

# 13. First test — successful registration

```ts
test(
  "should successfully register user and return a success message",
  async () => {
```

We're testing the happy path.

---

## Arrange

```ts
const userService = new UserService(
  mockName,
  mockEmail,
);
```

We create our SUT.

Then:

```ts
createUserSpy.mockResolvedValue(mockUser);
```

This means:

> Whenever `DatabaseService.createUser()` is called, return a resolved Promise containing `mockUser`.

Equivalent conceptual behavior:

```ts
async () => mockUser
```

---

Then:

```ts
subscribeUserSpy.mockResolvedValue({
  msg: "success",
});
```

We're telling the newsletter dependency:

> Pretend subscription succeeds.

So we're not touching a real database or newsletter system.

---

# 14. Act

```ts
const result = await userService.registerUser();
```

Now the actual production code runs.

Conceptually:

```text
registerUser()
     │
     ▼
createUser()
     │
     ▼
mockUser
     │
     ▼
subscribeUser()
     │
     ▼
success
     │
     ▼
CustomLogger.info()
     │
     ▼
return response
```

---

# 15. Assert — database call

```ts
expect(createUserSpy).toHaveBeenCalledWith(
  mockName,
  mockEmail,
);
```

We're not merely checking that the database method ran.

We're checking that it received the **correct arguments**.

Expected:

```ts
createUser("John", "test@test.com");
```

If production accidentally did:

```ts
createUser(this.email, this.name);
```

our test would catch it.

---

# 16. Assert — newsletter call

```ts
expect(subscribeUserSpy).toHaveBeenCalledWith(
  mockUser,
);
```

This verifies that the result returned from the database was passed to the newsletter service.

We are testing the interaction:

```text
Database
   │
   │ returns mockUser
   ▼
UserService
   │
   │ passes mockUser
   ▼
NewsletterService
```

That's a valuable service-level test.

---

# 17. Assert — returned result

```ts
expect(result).toEqual(successResponse);
```

This tests the observable output of the SUT.

Expected:

```ts
{
  msg: "user registered successfully"
}
```

Actual:

```ts
result
```

`toEqual()` compares the values structurally.

---

# 18. Second test — error type

```ts
test(
  "should throw CustomError when user registration fails",
  async () => {
```

Now we're testing the failure path.

---

## Arrange

```ts
const userService = new UserService(
  mockName,
  mockEmail,
);
```

Again, create the SUT.

Then:

```ts
createUserSpy.mockRejectedValue(
  new Error("Name is required"),
);
```

This is extremely important.

We're telling our mocked database:

> "Pretend that the database operation fails."

So:

```ts
await DatabaseService.createUser(...)
```

behaves like:

```ts
throw new Error("Name is required");
```

inside the Promise.

---

# 19. Why `mockRejectedValue()`?

Because `createUser()` is asynchronous.

We could technically write:

```ts
createUserSpy.mockImplementation(async () => {
  throw new Error("Name is required");
});
```

But:

```ts
mockRejectedValue(
  new Error("Name is required"),
);
```

is clearer and communicates our intention directly:

> "This mocked async function rejects."

---

# 20. Act + Assert together

```ts
await expect(
  userService.registerUser(),
).rejects.toBeInstanceOf(CustomError);
```

This line contains several concepts.

First:

```ts
userService.registerUser()
```

returns a Promise.

We don't immediately get an error object.

We get:

```text
Promise
  │
  └── eventually rejects with CustomError
```

So we use:

```ts
.rejects
```

to tell Jest:

> "This Promise is expected to reject."

Then:

```ts
.toBeInstanceOf(CustomError)
```

says:

> "The rejected value must be an instance of CustomError."

So we're testing:

```text
Database fails
     ↓
UserService catches it
     ↓
CustomError.throwError()
     ↓
CustomError is thrown
     ↓
Promise rejects
     ↓
Jest verifies CustomError
```

---

# 21. Why not `.toThrow()` directly?

Because:

```ts
registerUser()
```

is asynchronous.

This would be wrong:

```ts
expect(
  userService.registerUser(),
).toThrow();
```

`.toThrow()` expects a function that Jest can invoke synchronously.

For async functions we use:

```ts
await expect(
  userService.registerUser(),
).rejects.toThrow();
```

or:

```ts
await expect(
  userService.registerUser(),
).rejects.toBeInstanceOf(CustomError);
```

---

# 22. Third test — checking custom error details

```ts
test(
  "should call CustomError.throwError with the correct error details",
  async () => {
```

This test is slightly different.

We're specifically testing the interaction with our custom error helper.

---

## Arrange

```ts
const userService = new UserService(
  mockName,
  mockEmail,
);
```

Then:

```ts
createUserSpy.mockRejectedValue(
  new Error("Name is required"),
);
```

Again, database failure.

---

# 23. Why `try/catch` here?

```ts
try {
  await userService.registerUser();
  fail("Should have thrown an error");
} catch (error) {
```

We're deliberately using `try/catch` here because we're demonstrating another way to handle async errors.

The flow is:

```text
try
 │
 └── await registerUser()
          │
          ▼
       throws
          │
          ▼
       catch(error)
```

---

## `fail()`

```ts
fail("Should have thrown an error");
```

This is a safety mechanism.

Suppose our production code accidentally stops throwing.

Then:

```ts
await userService.registerUser();
```

would complete successfully.

Without `fail()`, the test might reach the end of the `try` block and behave differently than intended.

With:

```ts
fail(...)
```

we explicitly say:

> "If execution reaches this point, the test must fail because we expected an error."

---

# 24. The actual assertion

```ts
expect(customErrSpy).toHaveBeenCalledWith(
  HttpCodes.INTERNAL_SERVER_ERROR,
  AppCodes.REGISTER_USER_FAILED,
  "failed to register user",
);
```

This verifies exactly what our production code does:

```ts
CustomError.throwError(
  HttpCodes.INTERNAL_SERVER_ERROR,
  AppCodes.REGISTER_USER_FAILED,
  "failed to register user",
);
```

So the test protects all three pieces:

```text
HTTP code
    ↓
500

Application code
    ↓
REGISTER_USER_FAILED

Message
    ↓
failed to register user
```

---

# 25. The fourth test — the intentionally broken one

Now we reach:

```ts
it(
  "should return error message if name is not provided 2",
  async () => {
```

`it()` and `test()` are effectively interchangeable in Jest.

These:

```ts
test("...", () => {});
```

and:

```ts
it("...", () => {});
```

both define a test.

The problem isn't `it()`.

The problem is the **Arrange section**.

---

# 26. Look carefully at this

```ts
createUserSpy.mockResolvedValue(mockUser);
subscribeUserSpy.mockResolvedValue({
  msg: "success",
});
```

We're explicitly telling our dependencies:

```text
Database → SUCCESS
Newsletter → SUCCESS
```

Therefore:

```ts
await userService.registerUser();
```

**should succeed.**

But immediately afterward we write:

```ts
fail("Should have thrown an error");
```

So we're saying:

> "The operation should throw."

while simultaneously configuring it to succeed.

That's already logically contradictory.

---

# 27. Why did we get `ReferenceError`?

The important part is:

```text
Received constructor: ReferenceError
```

The reason is subtle.

Our `try` block does:

```ts
await userService.registerUser();
```

and because both dependencies are mocked to succeed, `registerUser()` completes successfully.

Then:

```ts
fail("Should have thrown an error");
```

runs.

But in our environment, `fail` is not available as a global function.

Therefore JavaScript tries to resolve:

```ts
fail
```

and can't find it.

So we get:

```text
ReferenceError: fail is not defined
```

That's why Jest says:

```text
Expected constructor: CustomError
Received constructor: ReferenceError
```

The `catch` catches that **ReferenceError**.

It is not catching our `CustomError`.

---

# 28. This is a very important testing lesson

Our test intended to produce:

```text
CustomError
```

but the test itself produced:

```text
ReferenceError
```

because the SUT never threw.

This is a classic example of why we should configure the mock according to the behavior we're testing.

We said:

```ts
createUserSpy.mockResolvedValue(mockUser);
```

but for an error test we need:

```ts
createUserSpy.mockRejectedValue(
  new Error("Name is required"),
);
```

---

# 29. Correct version of the fourth test

If we actually want to keep this test as another `try/catch` demonstration, it should be:

```ts
it(
  "should catch the CustomError when user registration fails",
  async () => {
    const userService = new UserService(
      mockName,
      mockEmail,
    );

    createUserSpy.mockRejectedValue(
      new Error("Name is required"),
    );

    try {
      await userService.registerUser();

      fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeInstanceOf(CustomError);

      expect(customErrSpy).toHaveBeenCalledWith(
        HttpCodes.INTERNAL_SERVER_ERROR,
        AppCodes.REGISTER_USER_FAILED,
        "failed to register user",
      );
    }
  },
);
```

However, there's another consideration.

We already have this:

```ts
await expect(
  userService.registerUser(),
).rejects.toBeInstanceOf(CustomError);
```

and this:

```ts
expect(customErrSpy).toHaveBeenCalledWith(...);
```

So the fourth test is largely redundant.

**For a production test suite, I would remove it.**

For learning Jest's `try/catch` approach, it's useful to keep temporarily.

---

# 30. One thing we should improve further

The test currently says:

```ts
"should return error message if name is not provided"
```

But we're doing:

```ts
createUserSpy.mockRejectedValue(
  new Error("Name is required"),
);
```

That doesn't mean `UserService` detected that the name was missing.

We're simply telling the database dependency:

> "Pretend that it rejected because the name was required."

`UserService` itself has no validation:

```ts
constructor(
  private name: string,
  private email: string,
) {}
```

There is no:

```ts
if (!this.name) {
   ...
}
```

So our test shouldn't claim that `UserService` validates the name.

A more accurate name is:

```ts
"should throw CustomError when database registration fails"
```

That's what we're actually testing.

---

# 31. The complete mental model

This entire test file can be understood as:

```text
                    UserService
                         │
                         │ registerUser()
                         ▼
              ┌─────────────────────┐
              │  DatabaseService    │
              │    createUser()     │
              └──────────┬──────────┘
                         │
                  ┌──────┴──────┐
                  │             │
              resolves       rejects
                  │             │
                  ▼             ▼
              mockUser        catch
                  │             │
                  ▼             ▼
        NewsletterService   CustomError
         subscribeUser()    .throwError()
                  │             │
                  ▼             ▼
             Logger.info    throws CustomError
                  │
                  ▼
              success
```

And our tests correspond to:

```text
TEST 1
──────
Database succeeds
Newsletter succeeds
        ↓
registerUser()
        ↓
success response
```

```text
TEST 2
──────
Database rejects
        ↓
registerUser()
        ↓
CustomError
        ↓
verify error type
```

```text
TEST 3
──────
Database rejects
        ↓
registerUser()
        ↓
CustomError.throwError(...)
        ↓
verify arguments
```

```text
TEST 4
──────
Database rejects
        ↓
registerUser()
        ↓
try/catch
        ↓
inspect thrown CustomError
```

---

# 32. What each Jest feature is teaching us

| Code                     | Concept                             |
| ------------------------ | ----------------------------------- |
| `describe()`             | Groups related tests                |
| `test()`                 | Defines a test                      |
| `it()`                   | Alias-style alternative to `test()` |
| `beforeEach()`           | Fresh setup before every test       |
| `afterEach()`            | Cleanup after every test            |
| `jest.mock()`            | Module mocking                      |
| `jest.fn()`              | Creates a mock function             |
| `jest.spyOn()`           | Spies on an existing method         |
| `mockResolvedValue()`    | Makes async mock resolve            |
| `mockRejectedValue()`    | Makes async mock reject             |
| `toHaveBeenCalledWith()` | Verifies function arguments         |
| `toEqual()`              | Compares returned values            |
| `.rejects`               | Tests rejected Promises             |
| `toThrow()`              | Tests thrown errors                 |
| `toBeInstanceOf()`       | Tests error/object type             |
| `try/catch`              | Manually inspects thrown errors     |
| `fail()`                 | Explicitly fails a test             |

---

# 33. The biggest lesson from this file

We should think of a unit test as controlling the world around our SUT.

For example:

```ts
createUserSpy.mockResolvedValue(mockUser);
```

means:

> "For this test, the database succeeds."

While:

```ts
createUserSpy.mockRejectedValue(
  new Error("Name is required"),
);
```

means:

> "For this test, the database fails."

Then we observe how **our SUT reacts**.

That's the heart of unit testing with mocks:

```text
        CONTROL DEPENDENCIES
                ↓
        RUN OUR SUT
                ↓
       OBSERVE BEHAVIOR
                ↓
           ASSERT
```

We don't test the real database here.

We don't test the real newsletter system here.

We don't test the logger here.

We test:

> **"Given this dependency behavior, does `UserService` respond correctly?"**

That's exactly what makes this a **unit test** rather than an integration test.

---

## Final recommendation for this file

For our actual learning repo, I'd keep **three tests**:

```text
1. Successful registration
2. Database failure → CustomError
3. CustomError receives correct details
```

And either delete or temporarily keep the fourth test purely to practice `try/catch`.

If keeping it, change its setup from:

```ts
createUserSpy.mockResolvedValue(mockUser);
subscribeUserSpy.mockResolvedValue({ msg: "success" });
```

to:

```ts
createUserSpy.mockRejectedValue(
  new Error("Name is required"),
);
```

and rename it so it describes **database failure**, not missing-name validation.

The current `ReferenceError` is actually useful: it shows us that **our test can fail because of a mistake in the test itself, not because the production code is wrong.** That's an important distinction to learn early.
