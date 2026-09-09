**Error handling in Jest** is one of the most important parts of writing reliable tests, because we don't only test the "happy path." We also need to prove that our code behaves correctly when something goes wrong.

We'll understand this from the basics and then move into **synchronous errors, async errors, custom errors, `try/catch`, `.toThrow()`, `.rejects`, error messages, error types, and common mistakes.**

---

# 1. What are we actually testing?

Suppose our application has:

```ts
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }

  return a / b;
}
```

There are two possible paths.

### Success

```text
divide(10, 2)
      ↓
     5
```

### Error

```text
divide(10, 0)
      ↓
throw Error
      ↓
"Cannot divide by zero"
```

A normal test checks:

```ts
expect(divide(10, 2)).toBe(5);
```

But we also need a test that proves:

> When an invalid input is supplied, our function throws the expected error.

That's where Jest's error matchers come in.

---

# 2. `.toThrow()`

The fundamental Jest matcher for synchronous errors is:

```ts
.toThrow()
```

Example:

```ts
test("throws when dividing by zero", () => {
  expect(() => divide(10, 0)).toThrow();
});
```

Notice something very important:

```ts
expect(() => divide(10, 0))
```

We pass a **function** to `expect()`.

We do **not** do this:

```ts
expect(divide(10, 0)).toThrow();
```

Why?

Because:

```ts
divide(10, 0)
```

executes immediately.

The error would be thrown **before Jest gets to `.toThrow()`**.

---

# 3. Why do we wrap the function?

This is probably the most important concept to understand about `.toThrow()`.

### Wrong

```ts
expect(divide(10, 0)).toThrow();
```

Execution:

```text
divide(10, 0)
     ↓
throws Error
     ↓
Jest never gets the function
     ↓
test fails unexpectedly
```

### Correct

```ts
expect(() => divide(10, 0)).toThrow();
```

Execution:

```text
expect()
   ↓
receives function
   ↓
.toThrow()
   ↓
Jest executes function
   ↓
Error thrown
   ↓
Jest verifies it
```

So the mental model is:

> **For synchronous errors, we give Jest a function whose execution should throw.**

---

# 4. Testing the error message

We don't necessarily want to test merely that *some* error occurred.

We can test the exact message:

```ts
test("throws the correct error message", () => {
  expect(() => divide(10, 0))
    .toThrow("Cannot divide by zero");
});
```

This verifies:

```text
Error
 └── message
      └── "Cannot divide by zero"
```

---

# 5. Testing with an `Error` object

We can also provide an actual `Error`:

```ts
test("throws the expected error", () => {
  expect(() => divide(10, 0))
    .toThrow(new Error("Cannot divide by zero"));
});
```

This checks the error's message as well.

However, in most ordinary tests, this is simpler:

```ts
.toThrow("Cannot divide by zero")
```

---

# 6. Testing the error type

Suppose our code throws:

```ts
throw new TypeError("Invalid type");
```

We can test the specific error class:

```ts
test("throws TypeError", () => {
  expect(() => {
    throw new TypeError("Invalid type");
  }).toThrow(TypeError);
});
```

We can also combine type and message:

```ts
test("throws TypeError with correct message", () => {
  expect(() => {
    throw new TypeError("Invalid type");
  }).toThrow(
    new TypeError("Invalid type"),
  );
});
```

---

# 7. Common error classes

JavaScript gives us several built-in error classes:

```text
Error
├── TypeError
├── RangeError
├── ReferenceError
├── SyntaxError
├── URIError
└── EvalError
```

For example:

```ts
throw new TypeError("Expected a string");
```

Our test can specifically verify:

```ts
expect(() => someFunction())
  .toThrow(TypeError);
```

This can be useful when the **type of error is part of our function's contract**.

---

# 8. Testing different invalid inputs

Let's make a more realistic function:

```ts
function getUserAge(age: number): string {
  if (age < 0) {
    throw new Error("Age cannot be negative");
  }

  if (age > 120) {
    throw new Error("Age is unrealistic");
  }

  return `Age: ${age}`;
}
```

We can test each error condition separately:

```ts
test("throws for negative age", () => {
  expect(() => getUserAge(-1))
    .toThrow("Age cannot be negative");
});

test("throws for unrealistic age", () => {
  expect(() => getUserAge(150))
    .toThrow("Age is unrealistic");
});
```

This is much better than having one vague test such as:

```ts
test("handles errors", ...)
```

Each test should describe **which error condition we're protecting against**.

---

# 9. Error handling with `try/catch`

Sometimes we want more control over the error object.

For example, perhaps we want to inspect:

```ts
error.message
error.name
error.code
error.statusCode
```

Then we can use `try/catch`.

Example:

```ts
test("returns the correct error details", () => {
  try {
    divide(10, 0);

    throw new Error("Expected divide() to throw");
  } catch (error) {
    expect(error).toBeInstanceOf(Error);

    expect(error).toHaveProperty(
      "message",
      "Cannot divide by zero",
    );
  }
});
```

However, there is a subtle problem here.

---

# 10. Why `try/catch` can produce a false-positive test

Consider:

```ts
test("throws an error", () => {
  try {
    divide(10, 2); // DOES NOT throw
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});
```

What happens?

```text
divide(10, 2)
      ↓
returns 5
      ↓
no error
      ↓
catch never executes
      ↓
no assertion executes
      ↓
Jest may consider test successful
```

That's bad.

We expected an error, but the test didn't actually prove that one occurred.

---

# 11. `expect.assertions()`

Jest provides:

```ts
expect.assertions(n)
```

This tells Jest:

> This test must execute exactly `n` assertions.

For example:

```ts
test("throws an error", () => {
  expect.assertions(2);

  try {
    divide(10, 0);
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty(
      "message",
      "Cannot divide by zero",
    );
  }
});
```

Now Jest expects:

```text
2 assertions
```

If `divide()` doesn't throw:

```text
catch doesn't execute
      ↓
0 assertions
      ↓
expected 2
      ↓
TEST FAILS
```

This prevents the false positive.

---

# 12. `expect.hasAssertions()`

Another matcher is:

```ts
expect.hasAssertions();
```

This simply tells Jest:

> At least one assertion must execute.

Example:

```ts
test("handles the error", () => {
  expect.hasAssertions();

  try {
    divide(10, 0);
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});
```

Difference:

```text
expect.assertions(2)
        ↓
exactly 2 assertions

expect.hasAssertions()
        ↓
at least 1 assertion
```

For precise error tests, `expect.assertions()` is often more explicit.

---

# 13. Async errors are different

Now we reach an important distinction.

Suppose our function is asynchronous:

```ts
async function fetchUser() {
  throw new Error("User not found");
}
```

This function doesn't synchronously throw.

It returns:

```text
Promise
   ↓
rejected
   ↓
Error("User not found")
```

Therefore:

```ts
expect(() => fetchUser()).toThrow();
```

is **not the correct pattern**.

Instead, we use:

```ts
await expect(fetchUser())
  .rejects
  .toThrow("User not found");
```

---

# 14. `.rejects.toThrow()`

This is the async equivalent of `.toThrow()`.

### Synchronous

```ts
expect(() => function())
  .toThrow("Something went wrong");
```

### Asynchronous

```ts
await expect(asyncFunction())
  .rejects
  .toThrow("Something went wrong");
```

Mental model:

```text
Synchronous
────────────────────
function()
   ↓
throws
   ↓
.toThrow()


Asynchronous
────────────────────
asyncFunction()
   ↓
Promise rejects
   ↓
.rejects
   ↓
.toThrow()
```

---

# 15. Testing an async rejection

Example:

```ts
async function createUser() {
  throw new Error("Email already exists");
}
```

Test:

```ts
test("rejects when email already exists", async () => {
  await expect(createUser())
    .rejects
    .toThrow("Email already exists");
});
```

This is the cleanest approach when the function is expected to reject.

---

# 16. `.rejects.toEqual()`

Not every async error needs `.toThrow()`.

Suppose a Promise rejects with a value:

```ts
async function getData() {
  return Promise.reject({
    status: 404,
    message: "Not found",
  });
}
```

We can test:

```ts
test("rejects with 404 error", async () => {
  await expect(getData()).rejects.toEqual({
    status: 404,
    message: "Not found",
  });
});
```

So `.rejects` unwraps the rejected Promise.

Conceptually:

```text
Promise.reject(error)
        ↓
     .rejects
        ↓
    error value
        ↓
   Jest matcher
```

---

# 17. Async `try/catch`

We can also use `try/catch` with asynchronous functions.

```ts
test("handles async error", async () => {
  expect.assertions(2);

  try {
    await createUser();
  } catch (error) {
    expect(error).toBeInstanceOf(Error);

    expect(error).toHaveProperty(
      "message",
      "Email already exists",
    );
  }
});
```

Notice:

```ts
await createUser();
```

The `await` is critical.

---

# 18. `fetch()` error handling

Let's connect this to what we just learned about async/fetch.

Suppose our application has:

```ts
async function getUser(id: string) {
  const response = await fetch(
    `https://api.example.com/users/${id}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}
```

Our test can mock a failed HTTP response:

```ts
test("throws when API returns an error", async () => {
  jest.spyOn(global, "fetch")
    .mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

  await expect(getUser("123"))
    .rejects
    .toThrow("Failed to fetch user");

  jest.restoreAllMocks();
});
```

Here the sequence is:

```text
getUser()
   ↓
fetch()
   ↓
Promise resolves
   ↓
response.ok === false
   ↓
throw Error
   ↓
Promise rejects
   ↓
.rejects.toThrow()
```

---

# 19. Network failure vs HTTP failure

This distinction is extremely important.

### Network failure

```ts
fetchMock.mockRejectedValue(
  new Error("Network error"),
);
```

The Promise itself rejects.

Test:

```ts
await expect(getUser("123"))
  .rejects
  .toThrow("Network error");
```

### HTTP failure

```ts
fetchMock.mockResolvedValue({
  ok: false,
  status: 500,
} as Response);
```

The `fetch()` Promise resolves, but our application detects:

```ts
response.ok === false
```

and throws its own error.

So:

```text
NETWORK FAILURE
fetch()
  ↓
Promise rejects
  ↓
.rejects


HTTP FAILURE
fetch()
  ↓
Promise resolves
  ↓
response.ok = false
  ↓
our code throws
  ↓
Promise rejects
  ↓
.rejects
```

---

# 20. Testing custom errors

In real applications, we often create custom error classes.

For example:

```ts
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User ${userId} not found`);
    this.name = "UserNotFoundError";
  }
}
```

Production code:

```ts
function findUser(id: string) {
  const user = null;

  if (!user) {
    throw new UserNotFoundError(id);
  }

  return user;
}
```

Test:

```ts
test("throws UserNotFoundError", () => {
  expect(() => findUser("user_123"))
    .toThrow(UserNotFoundError);
});
```

And:

```ts
test("throws correct user-not-found message", () => {
  expect(() => findUser("user_123"))
    .toThrow("User user_123 not found");
});
```

We can test both the **type** and the **message**.

---

# 21. Testing custom error properties

Suppose:

```ts
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

Our function:

```ts
function getData() {
  throw new ApiError("Unauthorized", 401);
}
```

If we need to inspect `statusCode`, we can use `try/catch`:

```ts
test("throws ApiError with status code 401", () => {
  expect.assertions(3);

  try {
    getData();
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);

    expect(error).toHaveProperty(
      "message",
      "Unauthorized",
    );

    expect(error).toHaveProperty(
      "statusCode",
      401,
    );
  }
});
```

This is one situation where `try/catch` becomes particularly useful.

---

# 22. `toThrow()` vs `try/catch`

We can think about it like this:

### Use `.toThrow()` when:

We simply want to verify:

```text
Did the function throw?
```

or:

```text
Did it throw this message/type?
```

Example:

```ts
expect(() => divide(10, 0))
  .toThrow("Cannot divide by zero");
```

### Use `try/catch` when:

We need to inspect the actual error object:

```text
message
name
statusCode
errorCode
custom properties
```

Example:

```ts
try {
  functionUnderTest();
} catch (error) {
  expect(error).toHaveProperty("statusCode", 401);
}
```

---

# 23. Testing functions that catch their own errors

This is another important situation.

Suppose our production code does:

```ts
function processPayment() {
  try {
    chargeCard();

    return {
      success: true,
      message: "Payment successful",
    };
  } catch (error) {
    return {
      success: false,
      message: "Payment failed",
    };
  }
}
```

Our function **doesn't throw** to the caller.

It catches the error and returns an object.

Therefore this would be wrong:

```ts
expect(() => processPayment())
  .toThrow();
```

Because `processPayment()` doesn't throw.

Instead, we test its returned behavior:

```ts
test("returns failure when payment throws", () => {
  // mock chargeCard to throw

  const result = processPayment();

  expect(result).toEqual({
    success: false,
    message: "Payment failed",
  });
});
```

This gives us a very important testing principle:

> **We test the behavior that is observable at the boundary of the function.**

If the function catches the error and converts it into a return value, our test should verify that return value.

---

# 24. Error handling in your `UserService`

This connects directly with the `UserService` we've already been working with.

Our service has something like:

```ts
try {
  const user = await DatabaseService.createUser(
    this.name,
    this.email,
  );

  await NewsletterService.subscribeUser(user);

  return {
    msg: "user registered successfully",
  };
} catch (error) {
  console.error(error);

  return {
    msg: "failed to register user",
  };
}
```

Notice what happens when something fails:

```text
DatabaseService.createUser()
          ↓
       throws
          ↓
       catch
          ↓
   console.error()
          ↓
returns:
{
  msg: "failed to register user"
}
```

Therefore our test should check:

```ts
expect(result).toEqual({
  msg: "failed to register user",
});
```

rather than:

```ts
await expect(service.registerUser())
  .rejects
  .toThrow();
```

because `registerUser()` **handles the error internally**.

That's a very important distinction for our current Jest work.

---

# 25. The three major error-testing patterns

We can now organize almost everything into three categories.

## Pattern 1 — Synchronous function throws

Production:

```ts
function foo() {
  throw new Error("Something went wrong");
}
```

Test:

```ts
expect(() => foo())
  .toThrow("Something went wrong");
```

---

## Pattern 2 — Async function rejects

Production:

```ts
async function foo() {
  throw new Error("Something went wrong");
}
```

Test:

```ts
await expect(foo())
  .rejects
  .toThrow("Something went wrong");
```

---

## Pattern 3 — Function catches the error

Production:

```ts
function foo() {
  try {
    something();
  } catch {
    return "failed";
  }
}
```

Test:

```ts
expect(foo()).toBe("failed");
```

The key question is:

> **Does the error escape the function, or does the function handle it?**

That determines how we test it.

---

# 26. A practical decision tree

When we write an error test, we can ask:

```text
                 Does our function throw?
                         │
                ┌────────┴─────────┐
                │                  │
               YES                 NO
                │                  │
         Is it synchronous?    Does it return
                │              an error result?
          ┌─────┴─────┐              │
          │           │              ▼
         YES          NO         Test result
          │           │
          ▼           ▼
   expect(() =>   await expect()
   fn()).toThrow   .rejects.toThrow()
```

And if the function catches the error:

```text
Error occurs
    ↓
catch
    ↓
return value
    ↓
test returned value
```

---

# 27. Common mistakes to avoid

### ❌ Mistake 1 — Calling the function directly with `.toThrow()`

```ts
expect(divide(10, 0)).toThrow();
```

### ✅ Correct

```ts
expect(() => divide(10, 0)).toThrow();
```

---

### ❌ Mistake 2 — Using `.toThrow()` for rejected Promises

```ts
expect(() => asyncFunction()).toThrow();
```

### ✅ Correct

```ts
await expect(asyncFunction())
  .rejects
  .toThrow();
```

---

### ❌ Mistake 3 — Forgetting `await`

```ts
expect(asyncFunction())
  .rejects
  .toThrow();
```

### ✅ Correct

```ts
await expect(asyncFunction())
  .rejects
  .toThrow();
```

---

### ❌ Mistake 4 — Testing an error that the function catches

If our function does:

```ts
catch {
  return {
    success: false,
  };
}
```

don't test:

```ts
await expect(fn()).rejects.toThrow();
```

Test:

```ts
expect(result).toEqual({
  success: false,
});
```

---

### ❌ Mistake 5 — `try/catch` without an assertion safeguard

Bad:

```ts
try {
  fn();
} catch (error) {
  expect(error).toBeInstanceOf(Error);
}
```

If `fn()` doesn't throw, the test may accidentally pass.

Better:

```ts
expect.assertions(1);

try {
  fn();
} catch (error) {
  expect(error).toBeInstanceOf(Error);
}
```

---

# 28. Our error-handling cheat sheet

| Production behavior      | Jest test                               |
| ------------------------ | --------------------------------------- |
| Sync function throws     | `expect(() => fn()).toThrow()`          |
| Check message            | `.toThrow("message")`                   |
| Check error class        | `.toThrow(ErrorClass)`                  |
| Async function rejects   | `await expect(fn()).rejects...`         |
| Async error message      | `.rejects.toThrow("message")`           |
| Promise resolves         | `.resolves...`                          |
| Need actual error object | `try/catch`                             |
| `try/catch` test         | `expect.assertions(n)`                  |
| Function catches error   | Test returned result                    |
| Network failure          | `mockRejectedValue()`                   |
| HTTP failure             | Mock resolved response with `ok: false` |

---

# 29. The core concept to put in our notes

The most important thing isn't memorizing individual matchers. It's understanding **where the error goes**:

```text
                 ERROR
                   │
        ┌──────────┼───────────┐
        │          │           │
        ▼          ▼           ▼
   sync throw   Promise      caught
                rejection
        │          │           │
        ▼          ▼           ▼
   toThrow()    rejects      test the
                .toThrow()   returned result
```

So our basic rules are:

```ts
// Synchronous error
expect(() => fn()).toThrow();
```

```ts
// Asynchronous rejection
await expect(fn()).rejects.toThrow();
```

```ts
// Error handled internally
const result = fn();

expect(result).toEqual(expectedResult);
```

And that last distinction is particularly relevant to the **`UserService` we've already been testing**: because `registerUser()` catches its dependency errors and returns `"failed to register user"`, our unit tests should verify that behavior rather than expecting `registerUser()` itself to reject.
