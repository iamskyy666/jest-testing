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

```ts
// CODE
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

```
---

**`clearAllMocks()`, `resetAllMocks()`, and `restoreAllMocks()` look almost identical but solve three different problems**.

The key is to understand **what exactly Jest remembers about a mock** and then what each API removes.

---

# 1. First: What does a Jest mock actually contain?

When we create:

```ts
const mockFn = jest.fn();
```

Jest doesn't just create an ordinary function.

It creates a function that can **record information about its usage**.

For example:

```ts
mockFn(10);
mockFn(20);
```

Jest can now know:

```text
How many times was it called?
        ↓
2

What arguments were used?
        ↓
[10]
[20]

What did it return?
        ↓
...
```

And we can inspect that with matchers:

```ts
expect(mockFn).toHaveBeenCalledTimes(2);

expect(mockFn).toHaveBeenCalledWith(10);
expect(mockFn).toHaveBeenCalledWith(20);
```

But mocks can also have **configured behavior**:

```ts
mockFn.mockReturnValue(100);
```

Now:

```ts
mockFn(); // 100
```

So there are two important categories of mock state:

```text
                 Jest Mock
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
     Call information      Implementation
          │                   │
     calls, args, etc.    return values,
                          implementations
```

And there's a third concept when using `jest.spyOn()`:

```text
Original implementation
          ↓
      spy/mock
          ↓
Temporary replacement
```

This is what gives us the three different operations.

---

# 2. The three APIs

The three APIs we need to distinguish are:

```ts
jest.clearAllMocks();

jest.resetAllMocks();

jest.restoreAllMocks();
```

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
Put original implementations back
```

That's the core.

---

# 3. `jest.clearAllMocks()`

`clearAllMocks()` removes the **recorded call information** from mocks.

It does **not** remove the mock's implementation.

For example:

```ts
const mockFn = jest.fn();

mockFn.mockReturnValue(42);

mockFn("hello");

console.log(mockFn.mock.calls.length);
// 1
```

Then:

```ts
jest.clearAllMocks();
```

Now:

```ts
mockFn.mock.calls.length
```

is:

```text
0
```

But the implementation is still there.

Therefore:

```ts
mockFn();
```

still returns:

```text
42
```

That's the crucial behavior.

---

# 4. Visualizing `clearAllMocks()`

Before:

```text
mockFn
│
├── calls
│    └── ["hello"]
│
├── call count
│    └── 1
│
└── implementation
     └── return 42
```

After:

```ts
jest.clearAllMocks();
```

we get:

```text
mockFn
│
├── calls
│    └── []
│
├── call count
│    └── 0
│
└── implementation
     └── return 42  ← STILL THERE
```

So:

> **Clear = erase usage history, keep behavior.**

---

# 5. Why would we want this?

Suppose we have:

```ts
const logger = {
  log: jest.fn(),
};
```

And multiple tests use it.

Test 1:

```ts
logger.log("hello");

expect(logger.log)
  .toHaveBeenCalledTimes(1);
```

After Test 1, Jest remembers:

```text
calls = 1
```

If Test 2 uses the same mock without clearing:

```ts
logger.log("world");

expect(logger.log)
  .toHaveBeenCalledTimes(1);
```

we could get:

```text
Expected: 1
Received: 2
```

because the call from Test 1 is still recorded.

That's **test pollution**.

---

# 6. `clearAllMocks()` solves call-history pollution

We can put:

```ts
beforeEach(() => {
  jest.clearAllMocks();
});
```

Then:

```text
Test #1
  ↓
mock called
  ↓
calls = 1

clearAllMocks()
  ↓
calls = 0

Test #2
  ↓
mock called
  ↓
calls = 1
```

The mock behavior remains intact.

---

# 7. `clearAllMocks()` is essentially about `.mock`

Jest mock functions expose information through:

```ts
mockFn.mock
```

For example:

```ts
mockFn.mock.calls
mockFn.mock.results
mockFn.mock.instances
```

When we clear:

```ts
jest.clearAllMocks();
```

Jest clears this recorded information.

Conceptually:

```text
mock.calls       → []
mock.results     → []
mock.instances   → []
```

But the configured implementation remains.

---

# 8. `resetAllMocks()`

Now things become stronger.

```ts
jest.resetAllMocks();
```

does what `clearAllMocks()` does **plus resets mock implementations**.

Think:

```text
clearAllMocks()
    ↓
clear history

resetAllMocks()
    ↓
clear history
+
reset behavior
```

---

# 9. Example

Suppose:

```ts
const mockFn = jest.fn();

mockFn.mockReturnValue(42);

console.log(mockFn());
// 42
```

Then:

```ts
jest.resetAllMocks();
```

The mock is reset to its default mock behavior.

So:

```ts
console.log(mockFn());
```

will no longer return:

```text
42
```

Instead, an ordinary Jest mock function returns:

```text
undefined
```

So conceptually:

```text
Before reset:

mockFn
 ├── calls → [...]
 └── implementation → return 42


After reset:

mockFn
 ├── calls → []
 └── implementation → default mock
```

---

# 10. `resetAllMocks()` is useful when behavior changes between tests

Suppose:

```ts
const getUser = jest.fn();
```

Test 1:

```ts
getUser.mockReturnValue({
  name: "Alice",
});
```

Test 2:

```ts
getUser.mockReturnValue({
  name: "Bob",
});
```

If we're carefully configuring the mock every time, we're fine.

But if we accidentally rely on the previous implementation, tests can become coupled.

Using:

```ts
beforeEach(() => {
  jest.resetAllMocks();
});
```

ensures:

```text
Test starts
    ↓
No previous calls
    ↓
No previous implementation
    ↓
Fresh mock configuration
```

---

# 11. `clear` vs `reset`

This is probably the most important comparison.

### `clearAllMocks()`

```text
"What happened?"
        ↓
Forget it.
```

### `resetAllMocks()`

```text
"What happened?"
        ↓
Forget it.

"What behavior did we configure?"
        ↓
Forget that too.
```

So:

```text
CLEAR
├── calls ❌
├── results ❌
├── instances ❌
└── implementation ✅

RESET
├── calls ❌
├── results ❌
├── instances ❌
└── implementation ❌
```

---

# 12. Now the third one: `restoreAllMocks()`

This one is different.

```ts
jest.restoreAllMocks();
```

is primarily about **restoring original implementations**, especially for spies created using:

```ts
jest.spyOn()
```

Suppose we have:

```ts
const calculator = {
  add(a: number, b: number) {
    return a + b;
  },
};
```

We create a spy:

```ts
const spy = jest.spyOn(calculator, "add");
```

Initially:

```text
calculator.add
      ↓
original implementation
```

The spy wraps it so Jest can observe it.

---

# 13. Temporarily replacing the implementation

We can even change its behavior:

```ts
spy.mockReturnValue(100);
```

Now:

```ts
calculator.add(2, 3);
```

returns:

```text
100
```

instead of:

```text
5
```

The original implementation has been replaced temporarily.

---

# 14. `restoreAllMocks()` puts it back

Now:

```ts
jest.restoreAllMocks();
```

The original implementation is restored.

So:

```text
Before spy

calculator.add()
      ↓
2 + 3
      ↓
5
```

Then:

```text
jest.spyOn()
      ↓
calculator.add()
      ↓
mock/spied implementation
      ↓
100
```

Then:

```text
restoreAllMocks()
      ↓
calculator.add()
      ↓
original implementation
      ↓
5
```

That's what **restore** means.

---

# 15. The critical distinction

Here's where we need to be careful.

Suppose we have:

```ts
const spy = jest.spyOn(calculator, "add");

spy.mockReturnValue(100);
```

Now:

```ts
jest.clearAllMocks();
```

does **not** restore `calculator.add()`.

It merely clears its call history.

The mock implementation remains.

Likewise:

```ts
jest.resetAllMocks();
```

resets the mock behavior, but it does not mean:

> "Put the original `calculator.add()` back."

For that, we use:

```ts
jest.restoreAllMocks();
```

---

# 16. The three operations visually

This is the mental model I'd memorize:

```text
                 MOCK
                  │
       ┌──────────┼──────────┐
       ↓          ↓          ↓
    History    Behavior    Original
       │          │        implementation
       ↓          ↓          │
     CLEAR      RESET        RESTORE
       │          │          │
       ↓          ↓          ↓
    forget     forget      put original
     calls     behavior      back
```

Or:

```text
CLEAR   → "Forget what happened."

RESET   → "Start the mock from scratch."

RESTORE → "Stop mocking and return to reality."
```

That last phrase is a particularly good mental shortcut.

---

# 17. Let's use our Calculator example

We can connect this directly to the Calculator we've been working with.

Suppose:

```ts
class Calculator {
  add(a: number, b: number) {
    return a + b;
  }
}
```

Our test:

```ts
describe("Calculator", () => {
  let calc: Calculator;

  beforeEach(() => {
    calc = new Calculator();
  });

  it("tracks calls", () => {
    const spy = jest.spyOn(calc, "add");

    calc.add(2, 3);

    expect(spy).toHaveBeenCalledWith(2, 3);
  });
});
```

Because `jest.spyOn()` by default **still calls the original implementation**, the result remains:

```ts
calc.add(2, 3); // 5
```

while Jest records the call.

---

# 18. Now let's change the implementation

```ts
const spy = jest.spyOn(calc, "add");

spy.mockReturnValue(999);
```

Now:

```ts
calc.add(2, 3);
```

returns:

```text
999
```

instead of:

```text
5
```

That's useful when we're testing another component that depends on `calc.add()`.

---

# 19. What happens with `clearAllMocks()`?

After:

```ts
calc.add(2, 3);

jest.clearAllMocks();
```

we have:

```text
call history → cleared
implementation → still mocked
```

So:

```ts
calc.add(2, 3);
```

still returns:

```text
999
```

---

# 20. What happens with `resetAllMocks()`?

After:

```ts
jest.resetAllMocks();
```

we have:

```text
call history → cleared
implementation → reset
```

The mock no longer has our `mockReturnValue(999)` configuration.

But here's the subtle part:

> `resetAllMocks()` does **not necessarily restore the original object method**.

The method can remain a Jest mock, just with its implementation reset.

That's why `restoreAllMocks()` exists.

---

# 21. What happens with `restoreAllMocks()`?

After:

```ts
jest.restoreAllMocks();
```

the spy is removed and the original method is put back.

So:

```ts
calc.add(2, 3);
```

again executes:

```ts
return a + b;
```

and gives:

```text
5
```

---

# 22. A very important table

| API                 | Clear calls? | Reset implementation? | Restore original? |
| ------------------- | -----------: | --------------------: | ----------------: |
| `clearAllMocks()`   |            ✅ |                     ❌ |                 ❌ |
| `resetAllMocks()`   |            ✅ |                     ✅ |                 ❌ |
| `restoreAllMocks()` |           ✅* |                    ❌* |                 ✅ |

`restoreAllMocks()` is specifically about mocks/spies that can be restored to an original implementation, especially `jest.spyOn()`.

The safest mental model is:

```text
clear → history
reset → mock state
restore → original code
```

---

# 23. Individual versions

We don't always have to affect every mock.

There are individual equivalents.

### Clear one mock

```ts
mockFn.mockClear();
```

### Reset one mock

```ts
mockFn.mockReset();
```

### Restore one spy

```ts
spy.mockRestore();
```

So:

```text
All mocks:
jest.clearAllMocks()
jest.resetAllMocks()
jest.restoreAllMocks()

One mock:
mockFn.mockClear()
mockFn.mockReset()
spy.mockRestore()
```

---

# 24. Why `mockRestore()` is different

This is especially important with:

```ts
jest.spyOn()
```

Example:

```ts
const spy = jest.spyOn(console, "log");
```

We have modified/wrapped:

```ts
console.log
```

When the test finishes, we don't want the rest of our tests accidentally using the modified version.

So:

```ts
spy.mockRestore();
```

puts `console.log` back.

Or globally:

```ts
jest.restoreAllMocks();
```

---

# 25. A common testing pattern

A very common pattern is:

```ts
describe("Something", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // tests...
});
```

This says:

> "Every test gets clean mock call history."

This is especially useful when the same mock is shared.

---

# 26. Another pattern: `resetAllMocks()`

We might use:

```ts
beforeEach(() => {
  jest.resetAllMocks();
});
```

when we want:

> "Every test starts with mocks having no previous configuration."

For example, if each test configures:

```ts
mockFn.mockReturnValue(...)
```

independently.

---

# 27. Another pattern: `restoreAllMocks()`

For spies:

```ts
afterEach(() => {
  jest.restoreAllMocks();
});
```

This is very useful.

For example:

```ts
it("spies on Date.now", () => {
  jest.spyOn(Date, "now")
    .mockReturnValue(123456);

  expect(Date.now()).toBe(123456);
});
```

After the test:

```ts
afterEach(() => {
  jest.restoreAllMocks();
});
```

Now other tests get the real `Date.now()` again.

---

# 28. Why `afterEach()` is often a good place for restore

Think about this:

```text
Test #1
   ↓
spy created
   ↓
method replaced
   ↓
test finishes
   ↓
restoreAllMocks()
   ↓
original method

Test #2
   ↓
starts clean
```

Without restoration:

```text
Test #1
   ↓
spy created
   ↓
method replaced
   ↓
test finishes

Test #2
   ↓
accidentally inherits modified method
```

That creates **test pollution**.

---

# 29. `clear` does NOT mean "fresh mock"

This is a common beginner mistake.

Suppose:

```ts
const mockFn = jest.fn()
  .mockReturnValue(50);
```

Then:

```ts
jest.clearAllMocks();
```

Some people expect:

```ts
mockFn() // undefined
```

But that's wrong.

We only cleared its history.

```ts
mockFn(); // 50
```

The behavior remains.

---

# 30. `reset` does NOT necessarily mean "original function"

Another common mistake.

Suppose:

```ts
const spy = jest.spyOn(obj, "method");

spy.mockReturnValue(50);
```

Then:

```ts
jest.resetAllMocks();
```

doesn't mean:

```text
original method restored
```

Instead, it means:

```text
mock is reset
```

If we specifically want the real method back:

```ts
jest.restoreAllMocks();
```

---

# 31. A useful hierarchy

Think of the operations as increasingly destructive to mock configuration:

```text
CLEAR
  │
  └── removes call history


RESET
  │
  ├── removes call history
  └── removes mock configuration


RESTORE
  │
  └── removes the mock/spy replacement
      and restores original implementation
```

Although "restore" isn't simply "more reset"; it serves a different purpose.

---

# 32. Configuration options in `jest.config.ts`

We can also configure Jest globally.

For example:

```ts
const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",

  clearMocks: true,
};
```

This is equivalent to having Jest automatically clear mock call history between tests.

---

We can also configure:

```ts
resetMocks: true,
```

and:

```ts
restoreMocks: true,
```

So conceptually:

```ts
const config = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
```

These correspond to the three concepts we've just learned.

---

# 33. Should we enable all three?

We shouldn't blindly add everything.

For learning, it's better to understand what each one does.

In real projects, the choice depends on the project's testing style.

For example, if we're primarily concerned about call-history pollution:

```ts
clearMocks: true
```

may be sufficient.

If we want every mock to be reset between tests:

```ts
resetMocks: true
```

may be appropriate.

If we're heavily using spies:

```ts
restoreMocks: true
```

can be particularly useful.

---

# 34. `clearMocks` vs `resetMocks` vs `restoreMocks`

The config names map directly:

```text
jest.config.ts

clearMocks: true
       ↓
jest.clearAllMocks()

resetMocks: true
       ↓
jest.resetAllMocks()

restoreMocks: true
       ↓
jest.restoreAllMocks()
```

This makes the config much easier to understand.

---

# 35. A practical example

Suppose:

```ts
const api = {
  getUser: () => "real user",
};
```

Test:

```ts
describe("API", () => {
  it("test 1", () => {
    const spy = jest.spyOn(api, "getUser");

    spy.mockReturnValue("Alice");

    expect(api.getUser()).toBe("Alice");
  });

  it("test 2", () => {
    expect(api.getUser()).toBe("real user");
  });
});
```

If we don't restore the spy properly, Test 2 can potentially inherit the altered behavior.

That's why we might do:

```ts
afterEach(() => {
  jest.restoreAllMocks();
});
```

Now:

```text
Test 1
 ↓
spy
 ↓
return Alice
 ↓
restore

Test 2
 ↓
real implementation
 ↓
return "real user"
```

Clean.

---

# 36. Our Calculator + hooks

Let's put everything we've learned together.

```ts
describe("Calculator", () => {
  let calc: Calculator;

  beforeEach(() => {
    calc = new Calculator();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should spy on add", () => {
    const spy = jest.spyOn(calc, "add");

    calc.add(2);

    expect(spy).toHaveBeenCalledWith(2);
  });

  it("should use mocked implementation", () => {
    const spy = jest.spyOn(calc, "add");

    spy.mockReturnValue(100);

    expect(calc.add(2)).toBe(100);
  });
});
```

Our lifecycle becomes:

```text
beforeEach()
    ↓
new Calculator()
    ↓
TEST
    ↓
spy/mock
    ↓
assertions
    ↓
afterEach()
    ↓
restoreAllMocks()
```

That's a very solid testing structure.

---

# 37. One more important distinction: `clear` vs `reset` vs `restore`

Let's imagine our mock has three layers:

```text
             Jest Mock
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
      History  Behavior  Original
```

### `clearAllMocks()`

```text
History  → DELETE
Behavior → KEEP
Original → irrelevant
```

### `resetAllMocks()`

```text
History  → DELETE
Behavior → RESET
Original → not restored
```

### `restoreAllMocks()`

```text
History/Mock → spy removed
Behavior     → original
Original     → RESTORED
```

---

# 38. The cheat sheet

We can keep this in our Jest notes:

```text
┌──────────────────────┬───────────────────────────────┐
│ API                  │ Meaning                       │
├──────────────────────┼───────────────────────────────┤
│ clearAllMocks()      │ Clear call history            │
│ resetAllMocks()      │ Clear history + mock behavior │
│ restoreAllMocks()    │ Restore original implementation│
└──────────────────────┴───────────────────────────────┘
```

And the individual versions:

```ts
mockFn.mockClear();     // clear history
mockFn.mockReset();     // reset mock
spy.mockRestore();      // restore original
```

---

# 39. The three sentences to memorize

If we remember nothing else, remember these:

### 🧹 Clear

> **"Forget what the mock did."**

```ts
jest.clearAllMocks();
```

### 🔄 Reset

> **"Forget what the mock did and how we configured it."**

```ts
jest.resetAllMocks();
```

### ↩️ Restore

> **"Stop replacing the real implementation; put the original back."**

```ts
jest.restoreAllMocks();
```

And the practical rule:

```text
jest.fn()
   ↓
clear/reset are common

jest.spyOn()
   ↓
restore is especially important
```

Once we start mocking **database repositories, Express dependencies, external APIs, `fs`, timers, modules, and other Node.js functionality**, this distinction will become extremely important.

--- 

```ts
// CODE
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

```

