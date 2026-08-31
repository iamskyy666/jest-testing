**Spies are one of the most important Jest concepts**, especially once we start testing Node.js services, controllers, database layers, APIs, and external dependencies.

The key is to understand that `jest.spyOn()` is **not the same thing as `jest.fn()`**.

---

# 1. What is a Spy?

A **spy** is a test double that lets us **observe a real function while it is being called**.

Suppose we have:

```ts
export function add(a: number, b: number) {
  return a + b;
}
```

We might want to know:

> "Was `add()` actually called?"

or:

> "How many times was `add()` called?"

or:

> "What arguments were passed to `add()`?"

That's where a spy comes in.

Conceptually:

```text
              ┌───────────────┐
              │   Our code    │
              └───────┬───────┘
                      │
                      ▼
                 add(2, 3)
                      │
                      ▼
              ┌───────────────┐
              │     SPY       │
              │ 👀 observes  │
              └───────┬───────┘
                      │
                      ▼
                 real add()
                      │
                      ▼
                     5
```

The important thing:

> **By default, `jest.spyOn()` keeps the original implementation.**

So a spy normally **observes without replacing the behavior**.

---

# 2. Basic `jest.spyOn()` syntax

The syntax is:

```ts
jest.spyOn(object, "methodName");
```

For example:

```ts
const math = {
  add(a: number, b: number) {
    return a + b;
  },
};
```

We can spy on `add()`:

```ts
const spy = jest.spyOn(math, "add");

math.add(2, 3);

expect(spy).toHaveBeenCalled();
```

We can also inspect arguments:

```ts
expect(spy).toHaveBeenCalledWith(2, 3);
```

And call count:

```ts
expect(spy).toHaveBeenCalledTimes(1);
```

---

# 3. Why do we need `spyOn()`?

Imagine we have this:

```ts
const logger = {
  log(message: string) {
    console.log(message);
  },
};
```

And another function:

```ts
function processUser() {
  logger.log("Processing user...");
  return true;
}
```

We don't necessarily care about the `console.log()` itself.

We want to test:

> Did `processUser()` tell the logger to log the message?

We can do:

```ts
const logSpy = jest.spyOn(logger, "log");

processUser();

expect(logSpy).toHaveBeenCalled();
expect(logSpy).toHaveBeenCalledWith("Processing user...");
```

We're testing the **interaction** between `processUser()` and `logger`.

That's a major use case for spies.

---

# 4. `spyOn()` versus simply calling the function

Without a spy:

```ts
logger.log("Hello");
```

Jest doesn't automatically give us information about that call.

With:

```ts
const spy = jest.spyOn(logger, "log");
```

Jest records information about calls.

We can ask:

```ts
spy.mock.calls
```

For example:

```ts
logger.log("Hello");
logger.log("World");
```

Then:

```ts
console.log(spy.mock.calls);
```

would conceptually give:

```ts
[
  ["Hello"],
  ["World"]
]
```

So:

```ts
spy.mock.calls[0]
```

is:

```ts
["Hello"]
```

and:

```ts
spy.mock.calls[1]
```

is:

```ts
["World"]
```

---

# 5. A complete example

Let's create a small object:

```ts
const userService = {
  createUser(name: string) {
    return {
      name,
      id: 123,
    };
  },
};
```

Our test:

```ts
describe("userService", () => {
  it("should call createUser()", () => {
    const spy = jest.spyOn(userService, "createUser");

    userService.createUser("Skyy");

    expect(spy).toHaveBeenCalled();
  });
});
```

The spy is watching:

```text
userService.createUser()
             │
             ▼
          SPY 👀
             │
             ▼
     original function
```

And because we didn't provide a replacement implementation, the original function still runs.

---

# 6. The original implementation still runs

This is probably the **single most important thing to understand** about `jest.spyOn()`.

Consider:

```ts
const calculator = {
  multiply(a: number, b: number) {
    return a * b;
  },
};
```

Test:

```ts
const spy = jest.spyOn(calculator, "multiply");

const result = calculator.multiply(5, 4);

expect(result).toBe(20);
expect(spy).toHaveBeenCalledWith(5, 4);
```

Both assertions work.

Why?

Because:

```ts
jest.spyOn(calculator, "multiply");
```

doesn't automatically turn `multiply()` into an empty mock.

It essentially says:

> "Jest, observe this method and record what happens, but continue using the original implementation."

So:

```text
multiply(5, 4)
       │
       ├── spy records:
       │      arguments → [5, 4]
       │      calls → 1
       │
       └── original implementation executes
                    ↓
                   20
```

---

# 7. Spy + `toHaveBeenCalled()`

The simplest matcher:

```ts
expect(spy).toHaveBeenCalled();
```

Means:

> This function was called at least once.

Example:

```ts
const spy = jest.spyOn(calculator, "multiply");

calculator.multiply(2, 3);

expect(spy).toHaveBeenCalled();
```

---

# 8. Spy + `toHaveBeenCalledTimes()`

We can verify exactly how many times:

```ts
expect(spy).toHaveBeenCalledTimes(2);
```

Example:

```ts
calculator.multiply(2, 3);
calculator.multiply(4, 5);

expect(spy).toHaveBeenCalledTimes(2);
```

This is useful when our business logic should call something a specific number of times.

---

# 9. Spy + `toHaveBeenCalledWith()`

This checks the arguments.

```ts
expect(spy).toHaveBeenCalledWith(2, 3);
```

Example:

```ts
calculator.multiply(2, 3);

expect(spy).toHaveBeenCalledWith(2, 3);
```

This is extremely useful for things like:

```ts
database.findUser(userId);
emailService.sendEmail(email);
logger.error(error);
jwt.sign(payload);
```

We can verify exactly what our code passed to the dependency.

---

# 10. Inspecting calls manually

Every Jest mock/spy has a `.mock` property.

For example:

```ts
const spy = jest.spyOn(calculator, "multiply");

calculator.multiply(2, 3);
calculator.multiply(10, 20);
```

We can inspect:

```ts
spy.mock.calls
```

Conceptually:

```ts
[
  [2, 3],
  [10, 20]
]
```

So:

```ts
spy.mock.calls.length
```

is:

```text
2
```

And:

```ts
spy.mock.calls[0]
```

is:

```ts
[2, 3]
```

This is useful for understanding what Jest is actually recording.

---

# 11. `jest.spyOn()` can also modify behavior

Here's where spies become particularly powerful.

We can tell the spy:

> "Don't use the real implementation this time."

Use:

```ts
mockImplementation()
```

Example:

```ts
const spy = jest
  .spyOn(calculator, "multiply")
  .mockImplementation(() => 100);
```

Now:

```ts
const result = calculator.multiply(5, 4);
```

returns:

```ts
100
```

instead of:

```ts
20
```

So we've changed the behavior.

---

# 12. This is where Spy becomes a Mock

Initially:

```ts
jest.spyOn(calculator, "multiply");
```

means:

```text
Observe real implementation
```

After:

```ts
jest
  .spyOn(calculator, "multiply")
  .mockImplementation(() => 100);
```

we're saying:

```text
Observe the call
+
Replace the implementation
```

So a spy can effectively become a mock.

This distinction is worth remembering:

```text
spyOn()
   │
   ├── default
   │      ↓
   │   observe + real implementation
   │
   └── mockImplementation()
          ↓
       observe + fake implementation
```

---

# 13. `mockReturnValue()`

If we simply want a fixed return value, we don't need `mockImplementation()`.

We can do:

```ts
const spy = jest
  .spyOn(calculator, "multiply")
  .mockReturnValue(100);
```

Now:

```ts
calculator.multiply(5, 4);
```

returns:

```ts
100
```

regardless of the arguments.

---

# 14. `mockReturnValueOnce()`

Sometimes we want different values for different calls.

```ts
const spy = jest
  .spyOn(calculator, "multiply")
  .mockReturnValueOnce(10)
  .mockReturnValueOnce(20)
  .mockReturnValueOnce(30);
```

Then:

```ts
calculator.multiply(1, 2); // 10
calculator.multiply(3, 4); // 20
calculator.multiply(5, 6); // 30
```

This is useful for testing different sequential states.

---

# 15. Async functions + spies

This becomes **very important in Node.js**.

Suppose:

```ts
const authService = {
  async generateToken(userId: string) {
    return `token-${userId}`;
  },
};
```

We can spy:

```ts
const spy = jest.spyOn(authService, "generateToken");

const token = await authService.generateToken("123");

expect(spy).toHaveBeenCalledWith("123");
expect(token).toBe("token-123");
```

The real async implementation executes.

---

# 16. Mocking an async spy

We can instead control the Promise:

```ts
const spy = jest
  .spyOn(authService, "generateToken")
  .mockResolvedValue("fake-token");
```

Now:

```ts
const token = await authService.generateToken("123");

expect(token).toBe("fake-token");
expect(spy).toHaveBeenCalledWith("123");
```

We could also simulate failure:

```ts
jest
  .spyOn(authService, "generateToken")
  .mockRejectedValue(new Error("JWT generation failed"));
```

Then:

```ts
await expect(
  authService.generateToken("123")
).rejects.toThrow("JWT generation failed");
```

This becomes extremely useful when testing real backend applications.

---

# 17. A very realistic Node.js example

Imagine our controller:

```ts
async function loginUser(email: string, password: string) {
  const user = await userService.findUser(email);

  if (!user) {
    throw new Error("User not found");
  }

  return authService.generateToken(user.id);
}
```

We don't necessarily want to test `findUser()` and JWT generation themselves.

Those should have their **own unit tests**.

Instead, in this test we want to verify:

> Does `loginUser()` correctly interact with its dependencies?

We can spy:

```ts
const findUserSpy = jest
  .spyOn(userService, "findUser")
  .mockResolvedValue({
    id: "123",
    email: "test@example.com",
  });

const tokenSpy = jest
  .spyOn(authService, "generateToken")
  .mockResolvedValue("fake-jwt");
```

Then:

```ts
const token = await loginUser(
  "test@example.com",
  "password"
);
```

Assertions:

```ts
expect(findUserSpy).toHaveBeenCalledWith(
  "test@example.com"
);

expect(tokenSpy).toHaveBeenCalledWith("123");

expect(token).toBe("fake-jwt");
```

Now we're testing the **orchestration logic** of `loginUser()`.

That's where spies really start becoming powerful.

---

# 18. Spying on `console.log`

Another common beginner example:

```ts
function greet(name: string) {
  console.log(`Hello ${name}`);
}
```

Test:

```ts
it("logs greeting", () => {
  const consoleSpy = jest.spyOn(console, "log");

  greet("Skyy");

  expect(consoleSpy).toHaveBeenCalledWith("Hello Skyy");
});
```

However, there's a problem.

Our test will actually print:

```text
Hello Skyy
```

to the terminal.

We can suppress the real implementation:

```ts
const consoleSpy = jest
  .spyOn(console, "log")
  .mockImplementation(() => {});
```

Now:

```ts
greet("Skyy");
```

doesn't actually print.

But Jest still records the call.

```ts
expect(consoleSpy).toHaveBeenCalledWith("Hello Skyy");
```

This is a classic example of:

```text
Spy
+
mockImplementation()
```

---

# 19. VERY IMPORTANT: Restore the original function

This is one of the biggest things to learn with spies.

Suppose we do:

```ts
jest.spyOn(console, "log");
```

We've modified `console.log` by wrapping it with Jest's spying mechanism.

We should restore it after the test:

```ts
spy.mockRestore();
```

Example:

```ts
it("logs greeting", () => {
  const spy = jest.spyOn(console, "log");

  greet("Skyy");

  expect(spy).toHaveBeenCalledWith("Hello Skyy");

  spy.mockRestore();
});
```

After:

```ts
spy.mockRestore();
```

the original `console.log` is back.

---

# 20. `mockRestore()` vs `mockClear()` vs `mockReset()`

This is **very important**.

### `mockClear()`

Clears recorded call information.

```ts
spy.mockClear();
```

Think:

> "Forget what happened."

It removes things such as:

```text
call count
arguments
instances
results
```

But the mocked implementation remains.

---

### `mockReset()`

Does more.

Think:

> "Forget what happened AND remove the mock implementation."

So:

```text
mockClear()
    ↓
clear call history

mockReset()
    ↓
clear call history
+
reset mock behavior
```

---

### `mockRestore()`

This is the important one for `spyOn()`.

Think:

> "Put the original function back."

```text
spyOn()
  ↓
replace/wrap original method
  ↓
mockRestore()
  ↓
original method restored
```

---

# 21. The easiest way to remember them

Think:

```text
CLEAR
 ↓
Forget calls

RESET
 ↓
Forget calls + behavior

RESTORE
 ↓
Bring the ORIGINAL function back
```

Or:

```text
mockClear()
    "What happened?"

mockReset()
    "What happened + what was the behavior?"

mockRestore()
    "Give me the original function back."
```

---

# 22. Use `afterEach()` for restoration

If we have many tests:

```ts
describe("Logger", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("test 1", () => {
    ...
  });

  it("test 2", () => {
    ...
  });
});
```

Then every test gets a clean environment.

This is particularly useful when we have multiple spies:

```ts
jest.spyOn(console, "log");
jest.spyOn(console, "error");
jest.spyOn(console, "warn");
```

Instead of manually:

```ts
logSpy.mockRestore();
errorSpy.mockRestore();
warnSpy.mockRestore();
```

we can use:

```ts
jest.restoreAllMocks();
```

---

# 23. A critical mistake to avoid

Don't do this:

```ts
const spy = jest.spyOn(userService, "findUser");

spy.mockRestore();

expect(spy).toHaveBeenCalled();
```

After restoration, we're no longer spying on future calls.

The correct order is:

```ts
const spy = jest.spyOn(userService, "findUser");

await userService.findUser("Skyy");

expect(spy).toHaveBeenCalled();

spy.mockRestore();
```

Test first → restore afterward.

---

# 24. Spies and encapsulation

Here's another important concept.

Suppose:

```ts
function calculateTotal() {
  return add(10, 20);
}
```

We might think:

```ts
const spy = jest.spyOn(...);
```

and spy on `add()`.

But **how the function is referenced matters** in JavaScript/TypeScript.

For example, if `add` is a local function binding:

```ts
function add(a: number, b: number) {
  return a + b;
}

function calculateTotal() {
  return add(10, 20);
}
```

we can't simply do:

```ts
jest.spyOn(...);
```

to magically intercept that local function.

`spyOn()` works on a **property of an object**:

```ts
object.method
```

That's why you will often see service dependencies structured like:

```ts
userService.findUser()
```

or:

```ts
repository.findById()
```

This makes them straightforward to spy on.

---

# 25. `jest.spyOn()` vs `jest.fn()`

This distinction is fundamental.

### `jest.fn()`

Creates a brand-new mock function.

```ts
const mockFn = jest.fn();
```

There was no original function involved.

```text
Nothing
   ↓
jest.fn()
   ↓
NEW mock function
```

---

### `jest.spyOn()`

Takes an **existing object method**.

```ts
const spy = jest.spyOn(object, "method");
```

Conceptually:

```text
Existing method
      ↓
  spyOn()
      ↓
Existing method + observation
```

And by default, the original implementation still runs.

---

# 26. Simple comparison

| Feature                                 | `jest.fn()`      | `jest.spyOn()` |
| --------------------------------------- | ---------------- | -------------- |
| Creates new function                    | ✅                | ❌              |
| Watches existing method                 | ❌                | ✅              |
| Original implementation exists          | ❌                | ✅              |
| Original implementation runs by default | N/A              | ✅              |
| Can inspect calls                       | ✅                | ✅              |
| Can change behavior                     | ✅                | ✅              |
| Can restore original                    | ❌                | ✅              |
| Works on object methods                 | Not specifically | ✅              |

---

# 27. Spy vs Stub vs Mock

Since we've been discussing **test doubles**, connect this to what we've already learned.

```text
                    TEST DOUBLES
                         │
        ┌────────────────┼────────────────┐
        │                │                │
       Stub            Spy              Mock
        │                │                │
   controls          observes          verifies
   behavior          behavior          interaction
```

A **Stub** primarily gives us controlled data:

```ts
mockResolvedValue(user);
```

A **Spy** primarily tells us:

```text
Was it called?
How many times?
With what arguments?
```

A **Mock** can both control behavior and verify interactions.

And Jest's mock system blurs these categories a little because the same mock object can often do several jobs.

For example:

```ts
const spy = jest
  .spyOn(userService, "findUser")
  .mockResolvedValue(fakeUser);
```

This one object is now:

```text
spy
 ↓
observes calls

+
 ↓
stub
 ↓
controls return value
```

That's why real-world Jest terminology can sometimes sound inconsistent.

---

# 28. The mental model I want us to keep

Whenever we see:

```ts
jest.spyOn(object, "method")
```

think:

> **"Jest, watch this existing method for me."**

By default:

```text
                 Existing method
                       │
                       ▼
                 ┌───────────┐
                 │   SPY 👀  │
                 └─────┬─────┘
                       │
                       ▼
                Original method
                       │
                       ▼
                    result
```

If we add:

```ts
.mockImplementation(...)
```

then:

```text
                 Existing method
                       │
                       ▼
                 ┌───────────┐
                 │   SPY 👀  │
                 └─────┬─────┘
                       │
                       ▼
                 Fake behavior
                       │
                       ▼
                    result
```

And when we're finished:

```ts
spy.mockRestore();
```

returns us to:

```text
Original method
     ↑
     │
 restored
```

---

# 29. A good exercise for our current Jest sandbox

Given our existing utilities, we could create an object like:

```ts
export const calculator = {
  add,
  subtract,
};
```

Then write tests around:

```ts
jest.spyOn(calculator, "add");
```

and practice:

```ts
toHaveBeenCalled()
toHaveBeenCalledTimes()
toHaveBeenCalledWith()
mockReturnValue()
mockReturnValueOnce()
mockImplementation()
mockRestore()
```

Once those feel natural, the next big step is **module mocking**, because that's where spies become extremely useful in real Node.js applications:

```text
Controller
    │
    ├── UserService
    │       └── Database
    │
    ├── AuthService
    │       └── JWT
    │
    └── EmailService
            └── SMTP/API
```

We'll use spies/mocks to isolate those dependencies and test the controller's behavior without actually hitting the database, generating real JWTs, or sending real emails.
