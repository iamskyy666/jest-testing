This is the point where we move from **“how do we make Jest tests pass?”** to **“how do production Node.js applications design and test errors?”**

For enterprise-level applications, custom error handling is not just about doing:

```ts
throw new Error("Something went wrong");
```

We usually want a **structured error architecture** where:

* application errors have known types
* errors carry HTTP status codes
* errors have machine-readable error codes
* controllers don't contain repetitive `try/catch` logic
* unexpected errors are separated from expected business errors
* sensitive implementation details aren't leaked to clients
* logs contain useful debugging information
* Jest verifies both the **type and behavior** of errors
* errors can be consistently handled across hundreds of endpoints

Let's build this from the ground up.

---

# 1. First: What problem are we solving?

Imagine our Node.js API has:

```text
POST /api/users
GET  /api/users/:id
POST /api/login
POST /api/payments
```

Different things can go wrong:

```text
User not found
Email already registered
Invalid password
Invalid JWT
Database unavailable
Payment declined
Third-party API timeout
Invalid request body
Unexpected programming bug
```

If we handle everything like this:

```ts
throw new Error("User not found");
```

we lose important information.

The application doesn't know whether this is:

```text
404 Not Found
400 Bad Request
401 Unauthorized
409 Conflict
500 Internal Server Error
503 Service Unavailable
```

So production applications generally create **custom error classes**.

---

# 2. The basic custom error

We can start with:

```ts
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}
```

Then:

```ts
throw new AppError("User not found", 404);
```

Now our error contains:

```text
message    → "User not found"
statusCode → 404
```

This is already better than:

```ts
throw new Error("User not found");
```

because we've attached application-specific information.

---

# 3. Why extend `Error`?

This:

```ts
class AppError extends Error
```

means our custom error **is still an Error**.

So:

```ts
const error = new AppError("User not found", 404);

console.log(error instanceof Error);     // true
console.log(error instanceof AppError);  // true
```

We retain normal JavaScript error behavior while adding our own information.

Conceptually:

```text
             Error
               │
               │ extends
               ▼
            AppError
               │
       ┌───────┴────────┐
       │                │
    message         statusCode
```

This is the foundation of most custom error architectures.

---

# 4. A more production-like `AppError`

A real application will usually need more than a status code.

For example:

```ts
class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
```

Now:

```ts
throw new AppError(
  "User not found",
  404,
  "USER_NOT_FOUND",
);
```

gives us something conceptually like:

```ts
{
  name: "AppError",
  message: "User not found",
  statusCode: 404,
  code: "USER_NOT_FOUND",
  isOperational: true
}
```

---

# 5. What is `isOperational`?

This is a useful production concept.

Not all errors are equal.

### Operational error

Something expected can go wrong during normal operation.

Examples:

```text
User doesn't exist
Invalid password
Invalid request
Payment declined
Database connection temporarily unavailable
```

These aren't necessarily programming bugs.

---

### Programmer/unexpected error

Something is fundamentally wrong with our application.

For example:

```ts
const user = undefined;

console.log(user.name);
```

or:

```ts
someFunctionThatDoesNotExist();
```

or a broken invariant:

```text
Impossible state reached
```

We generally don't want to tell the client:

```json
{
  "error": "Cannot read properties of undefined (reading 'name')"
}
```

Instead:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal server error"
  }
}
```

while the actual stack trace goes into our logs.

---

# 6. Why custom error classes are useful

Imagine our service:

```ts
class UserService {
  async getUser(id: string) {
    const user = await DatabaseService.findUser(id);

    if (!user) {
      throw new AppError(
        "User not found",
        404,
        "USER_NOT_FOUND",
      );
    }

    return user;
  }
}
```

Our service doesn't need to know anything about Express.

It simply says:

> "The requested user doesn't exist."

The controller/middleware can decide how that becomes an HTTP response.

This gives us separation of concerns.

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

The service creates a meaningful error.

The HTTP error middleware translates it into an HTTP response.

---

# 7. Centralized Express error middleware

This is one of the biggest production patterns.

Instead of:

```ts
app.get("/users/:id", async (req, res) => {
  try {
    const user = await userService.getUser(req.params.id);

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});
```

for every route, we can centralize error handling.

```ts
app.use((err, req, res, next) => {
  // centralized error handling
});
```

The architecture becomes:

```text
Request
   ↓
Controller
   ↓
Service
   ↓
Error thrown
   ↓
Express error middleware
   ↓
HTTP response
```

---

# 8. Production-style error middleware

A simplified version:

```ts
app.use((err: unknown, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
});
```

Now our application has two paths:

```text
AppError
   ↓
Known/expected error
   ↓
Use its status + code + message
```

versus:

```text
Unknown Error
   ↓
Log it
   ↓
Don't expose internals
   ↓
500 Internal Server Error
```

That's a very important production distinction.

---

# 9. Specialized error classes

As our application grows, we might create specialized errors.

For example:

```ts
class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}
```

Then:

```ts
throw new NotFoundError("User not found");
```

Or:

```ts
class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}
```

Then:

```ts
throw new ConflictError("Email already registered");
```

Or:

```ts
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}
```

Now our services become very readable:

```ts
if (!user) {
  throw new NotFoundError("User not found");
}

if (existingUser) {
  throw new ConflictError("Email already registered");
}
```

---

# 10. A realistic error hierarchy

We can have:

```text
Error
 │
 └── AppError
      │
      ├── BadRequestError       400
      ├── UnauthorizedError     401
      ├── ForbiddenError        403
      ├── NotFoundError         404
      ├── ConflictError         409
      └── ValidationError       422
```

This gives us predictable semantics.

For example:

```ts
throw new NotFoundError("User not found");
```

automatically means:

```text
HTTP 404
code: NOT_FOUND
```

---

# 11. Error codes are extremely useful

Consider:

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

Why have both?

Because **messages are for humans; codes are for software**.

Our frontend shouldn't ideally do:

```ts
if (error.message === "User not found") {
  // ...
}
```

That's fragile.

Instead:

```ts
if (error.code === "USER_NOT_FOUND") {
  // show appropriate UI
}
```

The message can change:

```text
"User not found"
```

to:

```text
"We couldn't find that user."
```

without breaking the frontend.

---

# 12. Now let's connect this to Jest

This is where our current Jest learning becomes directly useful.

Suppose:

```ts
class UserService {
  async getUser(id: string) {
    const user = await DatabaseService.findUser(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
```

We want our test to prove:

> When the user doesn't exist, `UserService` rejects with the correct error.

We can write:

```ts
test("throws NotFoundError when user does not exist", async () => {
  jest
    .spyOn(DatabaseService, "findUser")
    .mockResolvedValue(null);

  const service = new UserService();

  await expect(
    service.getUser("999"),
  ).rejects.toThrow("User not found");
});
```

That's already useful.

But we can go further.

---

# 13. Testing the error type

Because we have a custom class:

```ts
await expect(
  service.getUser("999"),
).rejects.toBeInstanceOf(NotFoundError);
```

Now we're testing the **actual error type**.

That's stronger than checking only the message.

We can test:

```ts
await expect(
  service.getUser("999"),
).rejects.toMatchObject({
  statusCode: 404,
  code: "NOT_FOUND",
});
```

So our test verifies:

```text
Error type
     +
HTTP status
     +
Error code
     +
Message
```

---

# 14. Testing synchronous custom errors

If the function isn't async:

```ts
function findUser(id: string) {
  if (!id) {
    throw new BadRequestError("User ID is required");
  }

  // ...
}
```

We use:

```ts
expect(() => findUser("")).toThrow(
  "User ID is required",
);
```

For the custom type:

```ts
expect(() => findUser("")).toThrow(BadRequestError);
```

Notice the difference:

### Async

```ts
await expect(
  service.getUser("999")
).rejects.toThrow(NotFoundError);
```

### Sync

```ts
expect(() => findUser("")).toThrow(BadRequestError);
```

This distinction is essential.

---

# 15. Don't make this mistake with async errors

This is wrong:

```ts
expect(
  service.getUser("999")
).toThrow(NotFoundError);
```

Why?

Because `getUser()` returns a Promise.

The error happens asynchronously.

So we need:

```ts
await expect(
  service.getUser("999")
).rejects.toThrow(NotFoundError);
```

Think:

```text
Synchronous
function()
   ↓
throws
   ↓
toThrow()

Asynchronous
function()
   ↓
Promise rejects
   ↓
rejects
   ↓
toThrow()
```

---

# 16. Testing custom properties

Suppose:

```ts
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}
```

We can capture the error:

```ts
test("returns correct error details", async () => {
  jest
    .spyOn(DatabaseService, "findUser")
    .mockResolvedValue(null);

  const service = new UserService();

  try {
    await service.getUser("999");

    throw new Error("Expected getUser() to throw");
  } catch (error) {
    expect(error).toBeInstanceOf(NotFoundError);

    expect(error).toMatchObject({
      statusCode: 404,
      code: "USER_NOT_FOUND",
      message: "User not found",
    });
  }
});
```

But there's an important TypeScript issue here.

`error` is usually:

```ts
unknown
```

So in production-quality TypeScript, we should narrow it:

```ts
if (error instanceof AppError) {
  expect(error.statusCode).toBe(404);
  expect(error.code).toBe("USER_NOT_FOUND");
}
```

---

# 17. Better: use `rejects` when possible

For most service tests, this is cleaner:

```ts
await expect(
  service.getUser("999"),
).rejects.toBeInstanceOf(NotFoundError);
```

and:

```ts
await expect(
  service.getUser("999"),
).rejects.toMatchObject({
  statusCode: 404,
  code: "USER_NOT_FOUND",
});
```

We don't need a `try/catch` unless we need to inspect something particularly specific.

---

# 18. Testing error propagation

This is another major enterprise testing concern.

Suppose:

```ts
async registerUser() {
  const user = await DatabaseService.createUser(...);

  await NewsletterService.subscribeUser(user);

  return {
    msg: "user registered successfully",
  };
}
```

What happens if the database throws?

```ts
DatabaseService.createUser()
    ↓
throws DatabaseError
```

Does `UserService`:

```text
A. swallow it?
B. replace it?
C. transform it?
D. propagate it?
```

Our test should define the expected behavior.

For example:

```ts
test("propagates database error", async () => {
  const databaseError = new Error("Database unavailable");

  createUserSpy.mockRejectedValue(databaseError);

  const userService = new UserService(
    mockName,
    mockEmail,
  );

  await expect(
    userService.registerUser(),
  ).rejects.toThrow("Database unavailable");
});
```

This tests **error propagation**.

---

# 19. Testing error transformation

Sometimes we don't want to expose the low-level error.

Suppose the database produces:

```text
MongoNetworkError
```

Our service might transform it:

```ts
try {
  return await DatabaseService.createUser(name, email);
} catch (error) {
  throw new AppError(
    "Unable to create user",
    503,
    "USER_CREATION_UNAVAILABLE",
  );
}
```

Now our test should verify the transformation:

```ts
test("transforms database failure into AppError", async () => {
  createUserSpy.mockRejectedValue(
    new Error("Mongo connection failed"),
  );

  const service = new UserService(
    mockName,
    mockEmail,
  );

  await expect(
    service.registerUser(),
  ).rejects.toMatchObject({
    statusCode: 503,
    code: "USER_CREATION_UNAVAILABLE",
    message: "Unable to create user",
  });
});
```

This is much closer to how enterprise applications are tested.

---

# 20. Error handling shouldn't be tested only at the service level

We can test the entire error pipeline.

For example:

```text
HTTP request
    ↓
Controller
    ↓
Service
    ↓
Custom Error
    ↓
Error Middleware
    ↓
HTTP Response
```

An integration test could verify:

```http
GET /users/999
```

produces:

```http
404
```

with:

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

This catches problems that a unit test can't.

For example, the service might correctly throw:

```ts
NotFoundError
```

but our Express error middleware might incorrectly turn it into:

```http
500
```

The unit test passes.

The integration test catches the real API problem.

---

# 21. Our testing layers for errors

This gives us a very useful architecture:

```text
                ERROR TESTING
                     │
        ┌────────────┼────────────┐
        │            │            │
       UNIT      INTEGRATION      E2E
        │            │            │
        ▼            ▼            ▼
 Service logic   HTTP response   User workflow
        │            │            │
        ▼            ▼            ▼
Correct error   Correct status   Correct UI
type/code       + JSON shape     behavior
```

For example:

### Unit test

```ts
expect(error).toBeInstanceOf(NotFoundError);
```

### Integration test

```ts
expect(response.status).toBe(404);
```

### E2E test

```text
User visits profile
     ↓
Profile doesn't exist
     ↓
UI displays "User not found"
```

Each layer answers a different question.

---

# 22. What should we NOT expose?

This is extremely important in production.

Suppose MongoDB throws:

```text
MongoServerError:
E11000 duplicate key error collection...
```

We generally don't want to blindly send:

```json
{
  "error": "MongoServerError: E11000 duplicate key..."
}
```

to the client.

Likewise, don't expose:

```text
stack traces
database connection strings
SQL queries
filesystem paths
internal service names
API keys
tokens
credentials
```

Instead:

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists."
  }
}
```

while the server logs the technical details.

---

# 23. Logging vs responding

These are two separate concerns.

Client receives:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal server error"
  }
}
```

Server logs:

```text
ERROR
Request ID: req_123
Route: POST /api/users
Error: MongoNetworkError
Stack: ...
User ID: ...
```

Conceptually:

```text
                 Error
                   │
          ┌────────┴────────┐
          │                 │
       Client              Logs
          │                 │
   safe information    detailed information
```

This separation is a major production principle.

---

# 24. Request IDs become useful

In real applications, we often assign every request an ID:

```text
requestId = "req_8f31a..."
```

Then the client might receive:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal server error",
    "requestId": "req_8f31a..."
  }
}
```

Our logs contain the same ID.

So if a user reports:

> "I got an error with request ID `req_8f31a...`"

we can search our logs and find the exact failure.

This is one reason structured errors become much more valuable in production systems.

---

# 25. A production-style structure

A Node.js/TypeScript project might eventually look something like:

```text
src/
│
├── errors/
│   ├── AppError.ts
│   ├── BadRequestError.ts
│   ├── NotFoundError.ts
│   ├── UnauthorizedError.ts
│   ├── ConflictError.ts
│   └── index.ts
│
├── middleware/
│   └── errorHandler.ts
│
├── controllers/
│   └── UserController.ts
│
├── services/
│   └── UserService.ts
│
├── repositories/
│   └── UserRepository.ts
│
└── ...
```

The exact structure varies by organization. We shouldn't treat one folder layout as a universal enterprise standard.

The **architecture** is what matters.

---

# 26. What our Jest tests should cover

For an error class:

```text
AppError
├── preserves message
├── has correct statusCode
├── has correct code
└── is instanceof Error
```

For a service:

```text
UserService
├── successful operation
├── user not found
├── duplicate user
├── dependency failure
└── error propagation/transformation
```

For middleware:

```text
errorHandler
├── handles AppError
├── handles unknown Error
├── returns correct HTTP status
├── returns correct response shape
└── doesn't leak internal details
```

For integration:

```text
HTTP API
├── 400
├── 401
├── 403
├── 404
├── 409
├── 422
├── 500
└── possibly 503
```

We don't necessarily test every theoretical error. We test meaningful behavior and important boundaries.

---

# 27. Our `UserService` example

Given the service we've already been working with:

```ts
UserService
    ↓
DatabaseService
    ↓
NewsletterService
```

we can eventually have tests like:

```text
UserService
│
├── ✅ registers user
│
├── ❌ database rejects
│      └── error propagates/transforms
│
├── ❌ newsletter rejects
│      └── error propagates/transforms
│
└── ❌ invalid input
       └── BadRequestError
```

And our lifecycle:

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
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

Then each test controls exactly how its dependency behaves:

```ts
createUserSpy.mockResolvedValue(mockUser);
```

or:

```ts
createUserSpy.mockRejectedValue(
  new Error("Database unavailable"),
);
```

or:

```ts
subscribeUserSpy.mockRejectedValue(
  new Error("Newsletter service unavailable"),
);
```

That's where everything we've learned about **spies, mocks, lifecycle hooks, async testing, and matchers** starts coming together.

---

# 28. The enterprise mental model

The most important thing to take away is that production error handling is a **pipeline**, not a `try/catch` scattered everywhere.

```text
                 REQUEST
                    │
                    ▼
               Controller
                    │
                    ▼
                Service
                    │
             ┌──────┴──────┐
             │             │
          success        failure
             │             │
             ▼             ▼
          Response      AppError
                           │
                           ▼
                  Error Middleware
                           │
                  ┌────────┴────────┐
                  │                 │
               Known              Unknown
               error               error
                  │                 │
                  ▼                 ▼
            Safe response       Log details
                                  │
                                  ▼
                             Generic 500
```

And Jest sits underneath the whole thing:

```text
                 Jest
                  │
       ┌──────────┼───────────┐
       ▼          ▼           ▼
     Unit     Integration     E2E
       │          │           │
       ▼          ▼           ▼
 Error class   HTTP error   User-visible
 Service       middleware    behavior
```

### The key principle

**We don't test that an error merely "happened." We test that the application handles the error correctly.**

That means asking:

* Was the correct error type produced?
* Was the correct error code produced?
* Was the correct status associated with it?
* Was the error propagated or transformed correctly?
* Did we avoid leaking internal details?
* Did the HTTP layer produce the correct response?
* Did the client ultimately receive the behavior we intended?

That's the jump from **basic Jest error testing** to the kind of error architecture and testing we'll encounter in real Node.js/TypeScript applications.
