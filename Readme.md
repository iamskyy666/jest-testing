
# 1. What Is Software Testing? 🧪

At the simplest level:

> **Testing is the process of checking whether our software behaves the way we expect it to behave.**

Suppose we have:

```ts
function add(a: number, b: number) {
  return a + b;
}
```

We expect:

```ts
add(2, 3);
```

to produce:

```text
5
```

A test allows us to formally verify that expectation.

Conceptually:

```text
Input
  ↓
Our Code
  ↓
Actual Output
  ↓
Compare with Expected Output
  ↓
PASS / FAIL
```

For example:

```text
add(2, 3)
    ↓
  add()
    ↓
    5
    ↓
Expected: 5
    ↓
  PASS ✅
```

If we accidentally change our function to:

```ts
function add(a: number, b: number) {
  return a - b;
}
```

our test catches it:

```text
Expected: 5
Received: -1

FAIL ❌
```

That's the fundamental idea behind testing.

---

# 2. Why Do We Need Testing?

This is where testing becomes important.

Imagine we're building a real Express application.

We might have:

```text
User Registration
      ↓
Validate email
      ↓
Hash password
      ↓
Create user
      ↓
Save to MongoDB
      ↓
Return response
```

Then our application grows:

```text
Login
Follow user
Unfollow user
Create post
Delete post
Send message
Upload image
Update profile
...
```

Eventually, we may have **thousands of lines of code**.

Now imagine we modify one small function.

That change might accidentally break something somewhere else.

Without automated tests, we might not discover the problem until a real user encounters it.

Testing gives us an **automated safety net**.

```text
                    ┌── Registration
                    ├── Login
Code changes ───────┼── Profile
                    ├── Posts
                    └── Messages
                           ↓
                       Test Suite
                           ↓
                    ✅ Everything works
                    ❌ Something broke
```

---

# 3. Testing Gives Us Confidence

This is probably the most important reason for testing.

Imagine we have 100 functions.

We change function #47.

Without tests:

> "We think we didn't break anything."

With tests:

> "We ran 437 tests and all 437 passed."

That's a completely different level of confidence.

Testing isn't primarily about finding bugs.

It's about giving us **confidence that our software continues to behave correctly as we change it**.

---

# 4. Testing Becomes More Important as Our Application Grows

Consider an early Node.js project:

```text
server.js
routes.js
controller.js
```

We might manually test everything using Postman:

```text
Start server
   ↓
Open Postman
   ↓
POST /users
   ↓
Check response
   ↓
POST /login
   ↓
Check response
```

That's manageable.

But imagine a production system:

```text
20 services
300 endpoints
500 utility functions
100 database models
50 developers
```

Are we going to manually test everything after every code change?

Obviously not.

That's where automated testing becomes essential.

---

# 5. Manual Testing vs Automated Testing

There are two broad approaches.

## Manual Testing

We interact with the application ourselves.

For example:

```text
Start server
   ↓
Open Postman
   ↓
POST /users
   ↓
Check response
```

A human performs the test.

---

## Automated Testing

We write code that performs the test.

For example:

```ts
test("adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});
```

Then we run:

```bash
npm test
```

Jest automatically executes the test.

```text
Tests
 ├── add() → PASS
 ├── subtract() → PASS
 ├── multiply() → PASS
 └── divide() → PASS
```

No human needs to manually verify every result.

---

# 6. What Exactly Can We Test?

Almost anything.

### Functions

```ts
calculateTotal()
```

### Classes

```ts
UserService
```

### API endpoints

```http
POST /api/users
```

### Database operations

```ts
User.findById()
```

### Authentication

```ts
verifyToken()
```

### Validation

```ts
validateEmail()
```

### Business logic

```ts
calculateDiscount()
```

### React components

```tsx
<LoginForm />
```

Different types of testing are useful for different parts of our application.

---

# 7. What Is Unit Testing?

Now we get to the important part.

> **Unit testing is testing the smallest meaningful pieces ("units") of our application in isolation.**

A **unit** is generally a small, independently testable piece of code.

It can be:

```text
Function
Class
Method
Module
Component
```

depending on the context.

---

# 8. Simple Unit Testing Example

Suppose we have:

```ts
export function multiply(a: number, b: number): number {
  return a * b;
}
```

This is a small unit.

We can test it:

```ts
test("multiplies two numbers", () => {
  expect(multiply(4, 5)).toBe(20);
});
```

We're testing one specific piece of functionality:

```text
multiply()
```

Not the entire application.

That's unit testing.

---

# 9. Why Do We Call It a "Unit"?

Think about a car.

A car contains:

```text
Engine
Brakes
Transmission
Battery
Steering
Wheels
```

We could test the **entire car**.

But we can also test individual components:

```text
Brake system → Does it work?
Engine       → Does it work?
Battery      → Does it work?
```

Software works similarly.

Our application contains:

```text
Functions
Classes
Modules
Services
Controllers
Components
```

For example:

```text
Application
│
├── Authentication
│   ├── validateEmail()
│   ├── hashPassword()
│   └── verifyPassword()
│
├── Users
│   ├── createUser()
│   ├── updateUser()
│   └── deleteUser()
│
└── Products
    ├── calculatePrice()
    └── applyDiscount()
```

Each function can potentially be treated as a unit.

---

# 10. The Key Idea: Isolation

**Isolation** is one of the most important concepts in unit testing.

Suppose we have:

```ts
function calculateDiscount(price: number, percentage: number) {
  return price - price * percentage;
}
```

We want to test:

```ts
calculateDiscount(100, 0.2);
```

We don't need:

```text
MongoDB
Express
HTTP server
Browser
Network
Redis
Authentication server
```

We simply want to test our function.

```text
calculateDiscount()
       ↑
       │
    isolated
       │
       ↓
   Test input
       ↓
   Test output
```

That's a unit test.

---

# 11. Unit Test Example With Real Logic

Suppose our Node.js application has:

```ts
export function calculateOrderTotal(
  price: number,
  quantity: number,
  tax: number
): number {
  const subtotal = price * quantity;
  return subtotal + subtotal * tax;
}
```

We could write:

```ts
test("calculates order total", () => {
  const result = calculateOrderTotal(100, 2, 0.1);

  expect(result).toBe(220);
});
```

We're testing:

```text
price = 100
quantity = 2
tax = 10%

subtotal = 200
tax = 20
total = 220
```

The test doesn't care about:

* Express
* MongoDB
* HTTP
* frontend
* authentication

We're testing one unit.

---

# 12. What Does a Test Actually Do?

Most tests follow a simple pattern:

```text
Arrange
   ↓
Act
   ↓
Assert
```

This is commonly called **AAA**.

---

## Arrange

We set up everything required for our test.

```ts
const price = 100;
const quantity = 2;
const tax = 0.1;
```

---

## Act

We execute the code we're testing.

```ts
const result = calculateOrderTotal(price, quantity, tax);
```

---

## Assert

We check whether the result is correct.

```ts
expect(result).toBe(220);
```

So our complete test becomes:

```ts
test("calculates order total", () => {
  // Arrange
  const price = 100;
  const quantity = 2;
  const tax = 0.1;

  // Act
  const result = calculateOrderTotal(price, quantity, tax);

  // Assert
  expect(result).toBe(220);
});
```

This AAA pattern will appear **everywhere** once we start writing tests.

---

# 13. Expected vs Actual

At the heart of testing is essentially:

```text
Expected Result
       vs
Actual Result
```

For example:

```ts
expect(result).toBe(220);
```

We're saying:

> "We expect `result` to be exactly `220`."

If:

```text
Actual   = 220
Expected = 220
```

then:

```text
PASS ✅
```

If:

```text
Actual   = 210
Expected = 220
```

then:

```text
FAIL ❌
```

---

# 14. Tests Are Executable Specifications

Here's a more advanced way to think about tests.

A good test doesn't merely say:

> "This code works."

It documents what our code **is supposed to do**.

For example:

```ts
test("rejects an invalid email", () => {
  expect(validateEmail("hello")).toBe(false);
});
```

This communicates a business rule:

```text
Invalid email → rejected
```

So tests can serve as **living documentation**.

Someone joining our project can read the tests and understand the expected behavior.

---

# 15. Unit Testing in a Node.js Application

Suppose our project has:

```text
src/
│
├── controllers/
│   └── userController.ts
│
├── services/
│   └── userService.ts
│
├── utils/
│   └── password.ts
│
└── models/
    └── User.ts
```

We might have:

```text
password.ts
     ↓
hashPassword()
verifyPassword()
```

Those functions are excellent candidates for unit tests.

For example:

```ts
describe("password utilities", () => {
  test("hashes a password", async () => {
    // ...
  });

  test("verifies a correct password", async () => {
    // ...
  });

  test("rejects an incorrect password", async () => {
    // ...
  });
});
```

---

# 16. Unit Testing vs Testing the Entire Application

This distinction is important.

Suppose:

```ts
createUser()
```

does this:

```text
createUser()
    ↓
validate input
    ↓
hash password
    ↓
MongoDB
    ↓
send email
    ↓
return response
```

Testing the entire thing at once is **not necessarily unit testing**.

That's closer to integration testing.

A unit test might instead test:

```text
validateUserInput()
```

separately.

Another unit test:

```text
hashPassword()
```

Another:

```text
generateUsername()
```

And so on.

---

# 17. Unit Testing vs Integration Testing

This distinction will become very important in our Jest course.

### Unit Test

Tests one piece in isolation.

```text
function
   ↓
test
```

Example:

```ts
calculateTax(100);
```

---

### Integration Test

Tests whether multiple parts work together.

For example:

```text
Express route
      ↓
Controller
      ↓
Service
      ↓
MongoDB
```

We might test:

```http
POST /users
```

and verify that a user actually gets created.

That's integration testing.

---

# 18. End-to-End Testing

There's another level:

```text
Unit
 ↓
Integration
 ↓
End-to-End
```

An E2E test might simulate an actual user:

```text
Open application
      ↓
Login
      ↓
Navigate to profile
      ↓
Edit profile
      ↓
Save
      ↓
Verify updated profile
```

It tests the whole system.

So conceptually:

```text
                 Entire System
              ┌──────────────────┐
              │    E2E Tests     │
              │                  │
              │  ┌────────────┐  │
              │  │Integration │  │
              │  │   Tests    │  │
              │  │            │  │
              │  │ ┌────────┐ │  │
              │  │ │ Unit   │ │  │
              │  │ │ Tests  │ │  │
              │  │ └────────┘ │  │
              │  └────────────┘  │
              └──────────────────┘
```

---

# 19. Why Do We Usually Have Lots of Unit Tests?

Because unit tests are generally:

* fast
* focused
* easy to diagnose
* relatively cheap to maintain
* easy to run frequently

Suppose we have:

```text
500 unit tests
20 integration tests
5 E2E tests
```

The 500 unit tests might finish in seconds.

But E2E tests may involve:

```text
Browser
Server
Database
Network
Authentication
```

and therefore take significantly longer.

---

# 20. The Testing Pyramid

We'll probably encounter the **Testing Pyramid**.

A simplified version looks like:

```text
              /\
             /  \
            / E2E\
           /------\
          /Integr. \
         /----------\
        /   Unit     \
       /--------------\
```

The idea is:

```text
Lots of unit tests
        ↓
Some integration tests
        ↓
Fewer E2E tests
```

Why?

Because unit tests are usually faster and cheaper, while E2E tests are more expensive and can be more fragile.

---

# 21. What Makes a Good Unit Test?

A good unit test should generally be:

### 1. Focused

Test one behavior.

Bad:

```text
test everything about users
```

Better:

```text
test rejects duplicate email
```

---

### 2. Deterministic

Given the same conditions, it should produce the same result.

```text
Input → Output
```

shouldn't randomly change.

---

### 3. Independent

One test shouldn't depend on another test having run first.

Bad:

```text
Test #2 only works if Test #1 created a user.
```

Better:

```text
Each test creates its own required state.
```

---

### 4. Fast

Unit tests should generally execute quickly.

---

### 5. Readable

Someone should understand what behavior we're testing.

For example:

```ts
test("returns false when password is incorrect", ...)
```

is much better than:

```ts
test("test1", ...)
```

---

# 22. What Happens When Our Code Changes?

This is where testing becomes extremely powerful.

Initially:

```ts
function isAdult(age: number) {
  return age >= 18;
}
```

Test:

```ts
test("returns true for adults", () => {
  expect(isAdult(18)).toBe(true);
});
```

Everything passes.

Later someone changes the implementation:

```ts
function isAdult(age: number) {
  return age > 18;
}
```

They accidentally introduced a bug.

Our test immediately catches it:

```text
Expected: true
Received: false

FAIL ❌
```

This is called **regression detection**.

---

# 23. What Is a Regression?

A regression happens when:

> **A change that was supposed to improve or modify our software causes previously working functionality to break.**

For example:

```text
Version 1
login() works ✅

        ↓

Developer changes password code

        ↓

Version 2
login() broken ❌
```

Tests help us detect that.

That's one of their biggest practical benefits in real-world development.

---

# 24. Testing Is Not Just "Finding Bugs"

This is a misconception worth correcting early.

Testing isn't simply:

```text
Developer writes code
        ↓
Tester tries to break it
```

Modern software development treats testing as part of development itself.

A healthy workflow can look like:

```text
Write code
   ↓
Write tests
   ↓
Run tests
   ↓
Change code
   ↓
Run tests again
   ↓
Refactor safely
```

---

# 25. What Is Jest?

Now we can introduce the tool..

> **Jest is a JavaScript/TypeScript testing framework.**

It provides tools for:

```text
Writing tests
Running tests
Making assertions
Mocking dependencies
Grouping tests
Measuring coverage
Reporting failures
```

For example:

```ts
test("adds numbers", () => {
  expect(2 + 3).toBe(5);
});
```

Jest executes that test and tells us whether it passed.

---

# 26. Jest's Mental Model

Think of Jest as our **test engine**.

Our application:

```text
src/
   userService.ts
   authService.ts
   calculator.ts
```

Our tests:

```text
tests/
   userService.test.ts
   authService.test.ts
   calculator.test.ts
```

Jest:

```text
             Jest
              ↓
      discovers test files
              ↓
       executes tests
              ↓
        assertions
              ↓
       PASS / FAIL
              ↓
         test report
```

---

# 27. Jest Doesn't Automatically Know What Is Correct

This is an important distinction.

Jest doesn't magically understand our business logic.

We tell Jest what the expected behavior is.

For example:

```ts
expect(add(2, 3)).toBe(5);
```

Jest provides:

```ts
expect()
```

and:

```ts
toBe()
```

But **we provide the expectation**.

Jest is essentially saying:

> "Give me the test and the expected behavior; I'll execute it and tell us whether reality matches our expectation."

---

# 28. Assertions

An **assertion** is a statement that verifies something about our result.

Example:

```ts
expect(result).toBe(10);
```

We're asserting:

```text
result === 10
```

Other examples we'll encounter:

```ts
expect(value).toBe(true);
expect(value).toBe(false);
expect(value).toEqual(object);
expect(value).toContain(item);
expect(value).toBeDefined();
expect(value).toBeNull();
```

Jest provides many **matchers** for these kinds of assertions.

---

# 29. A Complete Tiny Example

Application code:

```ts
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }

  return a / b;
}
```

Unit tests:

```ts
describe("divide", () => {
  test("divides two numbers", () => {
    const result = divide(10, 2);

    expect(result).toBe(5);
  });

  test("throws when dividing by zero", () => {
    expect(() => divide(10, 0)).toThrow(
      "Cannot divide by zero"
    );
  });
});
```

Notice we're testing **two different behaviors**:

```text
10 / 2 → 5
10 / 0 → Error
```

That's much better than testing only the happy path.

---

# 30. Happy Path vs Edge Cases

When writing tests, we shouldn't only test:

```text
Everything goes correctly
```

We should also test unusual situations.

For:

```ts
function getUser(id: string)
```

we might test:

```text
Valid ID
Invalid ID
Empty ID
User doesn't exist
Database failure
```

For:

```ts
calculateDiscount(price, percentage)
```

we might test:

```text
Normal price
Zero price
Large price
0% discount
100% discount
Invalid percentage
Negative price
```

This is where good testing becomes thoughtful rather than merely mechanical.

---

# 31. Unit Tests and Dependencies

Here's where Jest becomes particularly interesting for our Node.js journey.

Real functions often depend on other things.

For example:

```ts
async function getUserName(id: string) {
  const user = await User.findById(id);

  return user.name;
}
```

This function depends on:

```text
MongoDB
   ↓
User.findById()
```

If we're doing a **unit test**, we don't necessarily want to hit the real MongoDB.

Instead, we can replace the dependency with a **mock**.

Conceptually:

```text
                 getUserName()
                       ↓
                 User.findById()
                       ↓
                 ❌ Real MongoDB

                 Instead:

                 User.findById()
                       ↓
                    🎭 Mock
                       ↓
                  Fake user
```

Jest provides powerful mocking functionality for exactly this purpose.

We'll spend quite a bit of time on this.

---

# 32. Mocking

A **mock** is essentially a controlled replacement for a real dependency.

Suppose our production code does:

```ts
const user = await User.findById(id);
```

In a unit test, we could make it behave as if the database returned:

```ts
{
  id: "123",
  name: "Skyy"
}
```

without actually querying MongoDB.

Then we're testing:

```text
getUserName()
```

rather than:

```text
getUserName()
+
MongoDB
+
network
+
database state
```

That's isolation.

---

# 33. Unit Testing and TypeScript

Since we're using **TypeScript + Jest**, there's another useful distinction.

TypeScript catches many problems at compile time:

```ts
function add(a: number, b: number) {
  return a + b;
}
```

TypeScript can catch:

```ts
add("hello", 10);
```

But TypeScript **doesn't prove that our application behaves correctly at runtime**.

For example:

```ts
function isAdult(age: number) {
  return age > 18;
}
```

This is perfectly valid TypeScript.

But maybe our business requirement is:

```text
18-year-olds are adults.
```

TypeScript can't determine that.

A test can:

```ts
expect(isAdult(18)).toBe(true);
```

So:

```text
TypeScript
    ↓
Type / structural correctness

Jest tests
    ↓
Behavioral correctness
```

They're complementary.

---

# 34. TypeScript + Jest Together

Think of our development stack like this:

```text
                Our Node.js App
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
        TypeScript             Jest
             ↓                   ↓
      "Is our code          "Does our code
       type-safe?"            behave correctly?"
```

Neither replaces the other.

We want both.

---

# 35. Test Coverage

We'll also encounter **code coverage**.

Coverage attempts to tell us how much of our code was executed by our tests.

For example:

```text
Statements: 92%
Branches:   85%
Functions:  100%
Lines:      94%
```

This can be useful.

But here's an important warning:

> **100% test coverage does NOT mean 100% bug-free software.**

Imagine:

```ts
function isAdult(age: number) {
  return age > 18;
}
```

And we only test:

```ts
isAdult(25);
```

The line executes.

So coverage could be 100%.

But we haven't tested:

```ts
isAdult(18);
```

which might reveal a business-logic bug.

Therefore:

```text
Coverage ≠ Quality
```

Coverage is a metric, not proof of correctness.

---

# 36. What Testing Gives Us as Developers

Good testing provides several major benefits.

### Confidence

We can change our code without being terrified of breaking everything.

### Regression protection

Previously working functionality is continually checked.

### Faster debugging

A failing test often tells us exactly where the problem is.

### Better architecture

Code that's difficult to test often has excessive coupling.

### Documentation

Tests demonstrate intended behavior.

### Safer refactoring

We can restructure our implementation while preserving behavior.

---

# 37. Testing Forces Us to Think About Design

This is a surprisingly important benefit.

Suppose we have:

```ts
function registerUser() {
  // validate
  // database
  // email
  // logging
  // hashing
  // image upload
  // notifications
  // ...
}
```

Testing this function could become painful.

That pain may tell us:

> "This function is doing too much."

We might refactor:

```text
registerUser()
     │
     ├── validateUser()
     ├── hashPassword()
     ├── createUser()
     └── sendWelcomeEmail()
```

Now each piece becomes easier to test.

So testing can encourage:

```text
Small functions
        ↓
Low coupling
        ↓
Clear responsibilities
        ↓
Better architecture
```

---

# 38. The Big Picture

As we're starting this course, let's keep this hierarchy in our head:

```text
SOFTWARE TESTING
│
├── Manual Testing
│
└── Automated Testing
     │
     ├── Unit Testing
     │
     ├── Integration Testing
     │
     └── End-to-End Testing
```

And within automated testing:

```text
Unit Test
    ↓
Test one small unit
    ↓
Keep dependencies isolated
    ↓
Arrange
    ↓
Act
    ↓
Assert
    ↓
PASS / FAIL
```

Jest sits underneath our automated testing workflow as the framework that helps us execute and manage these tests.

---

# 39. Where We Are Right Now

We've just finished the basic Node.js/Express material, so our progression can look like:

```text
JavaScript
   ↓
TypeScript
   ↓
Node.js
   ↓
Express
   ↓
REST APIs
   ↓
Database
   ↓
       ⭐ WE ARE HERE
          Testing
             ↓
           Jest
             ↓
       Unit Testing
             ↓
          Mocking
             ↓
     Integration Testing
             ↓
        API Testing
             ↓
       Test Coverage
             ↓
          CI/CD
```

Eventually, when we're working professionally, the workflow can become:

```text
Developer changes code
        ↓
npm test
        ↓
Jest runs hundreds/thousands of tests
        ↓
       ┌───────────────┐
       │               │
     PASS             FAIL
       │               │
       ↓               ↓
 Continue           Fix code
       │               │
       └───────┬───────┘
               ↓
          Git commit
               ↓
             CI/CD
               ↓
          Production
```

That's why testing is such a big deal in professional backend development.

---

# 40. The 5 Concepts We Should Memorize First

Before diving deeper into Jest syntax, let's make sure these five ideas are crystal clear.

### 1. Testing

> **Checking whether our software behaves according to its expected behavior.**

### 2. Unit

> **A small, independently testable piece of software, commonly a function, method, class, or module.**

### 3. Unit Testing

> **Testing a small unit in isolation from its external dependencies.**

### 4. Assertion

> **A statement that verifies an actual result against an expected result.**

```ts
expect(actual).toBe(expected);
```

### 5. Mock

> **A controlled replacement for a dependency that we use to isolate the unit under test.**

And the core mental model:

```text
             UNIT TEST
                 │
                 ↓
          Small piece of code
                 │
                 ↓
             Give input
                 │
                 ↓
            Execute code
                 │
                 ↓
          Get actual result
                 │
                 ↓
       Compare with expected
                 │
           ┌─────┴─────┐
           ↓           ↓
         PASS         FAIL
          ✅           ❌
```

Once this mental model is solid, **Jest itself becomes much easier to understand**.

The Jest APIs such as:

```text
describe()
test()
it()
expect()
Matchers
beforeEach()
afterEach()
Mocks
Spies
Fixtures
Coverage
```

are essentially tools we use to implement this fundamental testing idea.

---

Now that we understand **what testing and unit testing are**, let's move into the actual **Jest syntax** we'll use with Node.js + TypeScript.

The goal shouldn't be to memorize random Jest APIs. We should understand **what each piece means, why it exists, and when we'd use it**.

---

# 1. The Basic Jest Mental Model

Almost every Jest test revolves around this:

```ts
test("description of behavior", () => {
  expect(actualValue).toBe(expectedValue);
});
```

We can mentally read it as:

> **Jest, run this piece of code and verify that the result matches our expectation.**

There are three important pieces:

```text
test()
  ↓
What behavior are we testing?

expect()
  ↓
What result did we get?

matcher
  ↓
What should that result be?
```

For example:

```ts
test("adds two numbers", () => {
  const result = add(2, 3);

  expect(result).toBe(5);
});
```

---

# 2. `test()`

The most fundamental Jest function is:

```ts
test()
```

It defines a test case.

Basic syntax:

```ts
test("description", () => {
  // test code
});
```

Example:

```ts
test("adds two numbers", () => {
  const result = 2 + 3;

  expect(result).toBe(5);
});
```

We can break it down:

```text
test(
  "adds two numbers",     ← test description
  () => {                  ← test function
    ...
  }
)
```

The first argument tells us **what behavior we're testing**.

The second argument contains the actual test.

---

# 3. Test Descriptions Matter

We shouldn't write:

```ts
test("test 1", () => {
  ...
});
```

That's useless when something fails.

Instead:

```ts
test("returns true when the user is authenticated", () => {
  ...
});
```

If Jest reports:

```text
FAIL returns true when the user is authenticated
```

we immediately understand what broke.

A test name should describe **behavior**, not implementation details.

Good:

```ts
test("rejects an invalid email", ...)
```

Less useful:

```ts
test("calls validateEmail function", ...)
```

The first describes **what our system should do**.

---

# 4. `it()` Is an Alias for `test()`

We'll also see:

```ts
it()
```

For example:

```ts
it("adds two numbers", () => {
  expect(2 + 3).toBe(5);
});
```

This is equivalent to:

```ts
test("adds two numbers", () => {
  expect(2 + 3).toBe(5);
});
```

There is no fundamental difference.

We can use either.

Many projects use:

```ts
it()
```

because the test reads naturally:

```text
it("should return the user")
```

Others prefer:

```ts
test("returns the user")
```

In the  beginning, I'd recommend sticking with **`test()`** initially because it's explicit.

---

# 5. `expect()`

This is the other fundamental Jest function.

```ts
expect(actual)
```

It tells Jest:

> "This is the value we want to make an assertion about."

Example:

```ts
const result = add(2, 3);

expect(result);
```

By itself, this doesn't actually assert anything.

We need a **matcher**.

---

# 6. Matchers

A matcher tells Jest **how we expect the value to behave**.

For example:

```ts
expect(result).toBe(5);
```

Here:

```text
expect(result)
      ↓
   actual value

.toBe(5)
      ↓
   expected value
```

So:

```ts
expect(result).toBe(5);
```

means:

> "We expect `result` to be exactly 5."

---

# 7. The Most Important Matcher: `toBe()`

```ts
expect(actual).toBe(expected);
```

`toBe()` performs strict equality.

For primitive values:

```ts
expect(5).toBe(5);
expect("hello").toBe("hello");
expect(true).toBe(true);
```

These pass.

```ts
expect(5).toBe(10);
```

fails.

---

# 8. `toBe()` and Objects — Important!

This is a common beginner trap.

Consider:

```ts
const user1 = {
  name: "Skyy",
};

const user2 = {
  name: "Skyy",
};
```

This:

```ts
expect(user1).toBe(user2);
```

fails.

Why?

Because objects are compared by **reference**, not by their contents.

```text
user1 ───────→ 📦 Object A
user2 ───────→ 📦 Object B
```

Even though:

```text
Object A
name = Skyy

Object B
name = Skyy
```

they are different objects.

---

# 9. `toEqual()`

For comparing object contents, we usually use:

```ts
toEqual()
```

Example:

```ts
expect(user1).toEqual(user2);
```

This passes because their structures and values are equal.

So remember:

```text
toBe()
  ↓
Strict identity/equality

toEqual()
  ↓
Deep value/structure comparison
```

For objects and arrays, `toEqual()` is extremely important.

---

# 10. `toStrictEqual()`

We also have:

```ts
toStrictEqual()
```

It performs an even stricter deep comparison than `toEqual()`.

For everyday Jest testing, we will commonly use:

```ts
toEqual()
```

and use:

```ts
toStrictEqual()
```

when differences involving things like `undefined` properties or object structure matter.

---

# 11. Truthiness Matchers

Jest provides convenient matchers for truthy/falsy values.

### `toBeTruthy()`

```ts
expect(value).toBeTruthy();
```

Passes when JavaScript considers the value truthy.

Examples:

```ts
expect("hello").toBeTruthy();
expect(123).toBeTruthy();
expect([]).toBeTruthy();
```

---

### `toBeFalsy()`

```ts
expect(value).toBeFalsy();
```

Examples:

```ts
expect(false).toBeFalsy();
expect(0).toBeFalsy();
expect("").toBeFalsy();
```

Remember:

> These use JavaScript's concept of truthiness.

---

# 12. `toBeDefined()`

Checks that a value isn't `undefined`.

```ts
expect(user).toBeDefined();
```

---

# 13. `toBeUndefined()`

Checks:

```ts
expect(value).toBeUndefined();
```

---

# 14. `toBeNull()`

Checks specifically for:

```ts
null
```

Example:

```ts
expect(result).toBeNull();
```

Notice that:

```text
null
```

and:

```text
undefined
```

are different JavaScript values.

---

# 15. Number Matchers

Jest gives us convenient numerical assertions.

### `toBeGreaterThan()`

```ts
expect(10).toBeGreaterThan(5);
```

### `toBeGreaterThanOrEqual()`

```ts
expect(10).toBeGreaterThanOrEqual(10);
```

### `toBeLessThan()`

```ts
expect(5).toBeLessThan(10);
```

### `toBeLessThanOrEqual()`

```ts
expect(10).toBeLessThanOrEqual(10);
```

These are useful for business logic.

Example:

```ts
expect(calculateAge(user)).toBeGreaterThanOrEqual(18);
```

---

# 16. Floating-Point Numbers

JavaScript has floating-point precision issues.

For example:

```ts
0.1 + 0.2
```

doesn't produce an exact mathematical `0.3` internally.

Therefore, instead of:

```ts
expect(0.1 + 0.2).toBe(0.3);
```

we can use:

```ts
expect(0.1 + 0.2).toBeCloseTo(0.3);
```

This is useful when testing calculations involving decimals.

---

# 17. String Matchers

### `toContain()`

For strings:

```ts
expect("Hello World").toContain("World");
```

Passes.

---

### `toMatch()`

We can use a regular expression:

```ts
expect("hello@example.com").toMatch(
  /@/
);
```

Or:

```ts
expect("Hello World").toMatch(/World/);
```

This is useful for testing patterns.

---

# 18. Array Matchers

Suppose:

```ts
const users = ["Alice", "Bob", "Charlie"];
```

We can write:

```ts
expect(users).toContain("Bob");
```

We can also check array contents:

```ts
expect(users).toEqual([
  "Alice",
  "Bob",
  "Charlie",
]);
```

---

# 19. `toHaveLength()`

Very useful:

```ts
expect(users).toHaveLength(3);
```

We can use it with:

```text
Arrays
Strings
Other length-bearing values
```

Example:

```ts
expect("Hello").toHaveLength(5);
```

---

# 20. Negating an Assertion With `.not`

This is extremely important.

Suppose:

```ts
expect(value).toBe(10);
```

We can reverse it:

```ts
expect(value).not.toBe(10);
```

This means:

> "We expect `value` NOT to be 10."

Examples:

```ts
expect(result).not.toBeNull();

expect(users).not.toContain("Unknown");

expect(password).not.toBe("123456");
```

The general syntax is:

```ts
expect(value).not.<matcher>();
```

---

# 21. `describe()`

Now let's move beyond individual tests.

When we have several related tests, we can group them using:

```ts
describe()
```

Example:

```ts
describe("calculateDiscount", () => {
  test("applies 10% discount", () => {
    // ...
  });

  test("returns original price when discount is 0%", () => {
    // ...
  });

  test("handles 100% discount", () => {
    // ...
  });
});
```

This gives our test suite structure.

Conceptually:

```text
describe()
│
├── test()
├── test()
└── test()
```

---

# 22. Why Use `describe()`?

Suppose our application has:

```text
Authentication
Users
Products
Orders
Payments
```

We can organize our tests:

```ts
describe("Authentication", () => {
  test("logs in with valid credentials", () => {});
  test("rejects invalid password", () => {});
  test("rejects unknown email", () => {});
});

describe("Users", () => {
  test("creates a user", () => {});
  test("updates a user", () => {});
  test("deletes a user", () => {});
});
```

Our output becomes much easier to understand.

---

# 23. Nested `describe()`

We can even nest them.

```ts
describe("UserService", () => {
  describe("createUser", () => {
    test("creates a valid user", () => {});
    test("rejects duplicate email", () => {});
  });

  describe("deleteUser", () => {
    test("deletes an existing user", () => {});
    test("throws when user doesn't exist", () => {});
  });
});
```

This gives us a hierarchy:

```text
UserService
│
├── createUser
│   ├── creates valid user
│   └── rejects duplicate email
│
└── deleteUser
    ├── deletes existing user
    └── throws if user doesn't exist
```

---

# 24. Setup and Teardown

Real tests often require setup.

For example:

```text
Create test data
Run test
Clean up test data
```

Jest provides lifecycle functions.

The major ones are:

```ts
beforeAll()
afterAll()
beforeEach()
afterEach()
```

These are extremely important.

---

# 25. `beforeEach()`

Runs **before every test**.

Example:

```ts
beforeEach(() => {
  console.log("Runs before every test");
});
```

Suppose we have:

```ts
describe("UserService", () => {
  beforeEach(() => {
    // setup
  });

  test("creates user", () => {
    // ...
  });

  test("updates user", () => {
    // ...
  });
});
```

The lifecycle becomes:

```text
beforeEach
    ↓
test 1
    ↓
beforeEach
    ↓
test 2
    ↓
beforeEach
    ↓
test 3
```

---

# 26. `afterEach()`

Runs after every test.

```ts
afterEach(() => {
  // cleanup
});
```

For example:

```text
beforeEach
   ↓
test
   ↓
afterEach
```

This is useful for resetting mocks, clearing state, etc.

---

# 27. `beforeAll()`

Runs once before all tests in a scope.

```ts
beforeAll(() => {
  // setup once
});
```

For example:

```text
beforeAll
    ↓
test 1
test 2
test 3
test 4
```

This is useful when something expensive needs to be initialized once.

---

# 28. `afterAll()`

Runs once after all tests.

```ts
afterAll(() => {
  // final cleanup
});
```

So our four lifecycle hooks are:

```text
beforeAll()
    ↓
beforeEach()
    ↓
test()
    ↓
afterEach()
    ↓
afterAll()
```

But remember: `beforeEach` and `afterEach` happen around **every individual test**, while `beforeAll` and `afterAll` happen once for the group.

---

# 29. Example of All Four

```ts
describe("UserService", () => {
  beforeAll(() => {
    console.log("Before all tests");
  });

  beforeEach(() => {
    console.log("Before each test");
  });

  afterEach(() => {
    console.log("After each test");
  });

  afterAll(() => {
    console.log("After all tests");
  });

  test("creates user", () => {
    console.log("Test 1");
  });

  test("updates user", () => {
    console.log("Test 2");
  });
});
```

The approximate execution order is:

```text
Before all tests

Before each test
Test 1
After each test

Before each test
Test 2
After each test

After all tests
```

This lifecycle becomes especially important once we start testing databases and mocks.

---

# 30. Testing Asynchronous Code

Node.js applications are heavily asynchronous.

We'll frequently have:

```ts
async function getUser() {
  const user = await User.findById("123");

  return user;
}
```

Our tests therefore need to handle asynchronous operations.

Jest supports this very well.

---

# 31. Using `async/await`

We can simply make our test callback `async`.

```ts
test("gets user", async () => {
  const user = await getUser();

  expect(user.name).toBe("Skyy");
});
```

This is one of the most common patterns we'll use in Node.js testing.

---

# 32. Testing Promises With `.resolves`

Suppose:

```ts
function getUser() {
  return Promise.resolve({
    name: "Skyy",
  });
}
```

We can write:

```ts
test("gets user", async () => {
  await expect(getUser()).resolves.toEqual({
    name: "Skyy",
  });
});
```

The structure is:

```text
expect(Promise)
       ↓
 .resolves
       ↓
 matcher
```

---

# 33. Testing Rejected Promises With `.rejects`

Suppose:

```ts
function login() {
  return Promise.reject(
    new Error("Invalid credentials")
  );
}
```

We can test:

```ts
test("rejects invalid credentials", async () => {
  await expect(login()).rejects.toThrow(
    "Invalid credentials"
  );
});
```

This is extremely useful for Node.js services.

---

# 34. Testing Errors With `toThrow()`

For synchronous code:

```ts
function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }

  return a / b;
}
```

Test:

```ts
test("throws when dividing by zero", () => {
  expect(() => divide(10, 0)).toThrow(
    "Cannot divide by zero"
  );
});
```

Notice something important.

We don't do:

```ts
expect(divide(10, 0)).toThrow();
```

because `divide()` would execute **before** `expect()` gets the value.

Instead, we pass a function:

```ts
expect(() => divide(10, 0))
```

so Jest can execute it and observe the thrown error.

---

# 35. Testing Error Types

We can also test the error itself:

```ts
expect(() => divide(10, 0)).toThrow(Error);
```

Or:

```ts
expect(() => divide(10, 0)).toThrow(
  "Cannot divide by zero"
);
```

This lets us test both:

```text
Error happened
```

and:

```text
Correct error happened
```

---

# 36. `.resolves` and `.rejects` Mental Model

Think of it like this:

```text
Promise resolves
       ↓
expect(promise)
       ↓
.resolves
       ↓
matcher
```

Example:

```ts
await expect(getUser()).resolves.toEqual(user);
```

Whereas:

```text
Promise rejects
       ↓
expect(promise)
       ↓
.rejects
       ↓
matcher
```

Example:

```ts
await expect(login()).rejects.toThrow();
```

---

# 37. Jest Mocks

Now we're reaching one of the most important parts of Jest for backend development:

> **Mocking**

Suppose:

```ts
async function getUserName(id: string) {
  const user = await User.findById(id);

  return user.name;
}
```

We don't necessarily want our unit test to actually access MongoDB.

We can mock the dependency.

Jest provides:

```ts
jest.fn()
jest.mock()
jest.spyOn()
```

These are extremely important.

---

# 38. `jest.fn()`

`jest.fn()` creates a mock function.

Example:

```ts
const mockFn = jest.fn();
```

Now:

```ts
mockFn();
mockFn();
mockFn();
```

Jest can keep track of how that function was used.

For example:

```ts
expect(mockFn).toHaveBeenCalled();
```

---

# 39. `toHaveBeenCalled()`

Suppose:

```ts
const mockFn = jest.fn();

mockFn();
```

We can assert:

```ts
expect(mockFn).toHaveBeenCalled();
```

This verifies that our function was called at least once.

---

# 40. `toHaveBeenCalledTimes()`

We can be more specific:

```ts
expect(mockFn).toHaveBeenCalledTimes(3);
```

If we call:

```ts
mockFn();
mockFn();
mockFn();
```

the test passes.

This is useful when we care about interactions between components.

---

# 41. `toHaveBeenCalledWith()`

We can verify the arguments:

```ts
const mockFn = jest.fn();

mockFn("Skyy", 25);
```

Then:

```ts
expect(mockFn).toHaveBeenCalledWith(
  "Skyy",
  25
);
```

We're testing:

```text
Was the function called?
        ↓
Yes
        ↓
Was it called with these arguments?
        ↓
Yes
        ↓
PASS
```

---

# 42. Mock Return Values

We can tell a mock what to return.

```ts
const mockFn = jest.fn();

mockFn.mockReturnValue(42);
```

Now:

```ts
mockFn();
```

returns:

```text
42
```

We can also use:

```ts
mockReturnValueOnce()
```

for a particular call.

---

# 43. Mocking Asynchronous Functions

Very important for Node.js.

We can use:

```ts
mockResolvedValue()
```

Example:

```ts
const mockGetUser = jest.fn();

mockGetUser.mockResolvedValue({
  id: "123",
  name: "Skyy",
});
```

Then:

```ts
const user = await mockGetUser();
```

returns our fake user.

For rejected promises:

```ts
mockRejectedValue()
```

Example:

```ts
mockGetUser.mockRejectedValue(
  new Error("Database error")
);
```

---

# 44. `jest.spyOn()`

Another very useful API:

```ts
jest.spyOn()
```

A spy allows us to observe an existing object's method.

Suppose:

```ts
const userService = {
  getUser() {
    return "Skyy";
  },
};
```

We can do:

```ts
const spy = jest.spyOn(
  userService,
  "getUser"
);
```

Now Jest can track calls to:

```ts
userService.getUser();
```

We can check:

```ts
expect(spy).toHaveBeenCalled();
```

---

# 45. Mock vs Spy

This distinction is important.

### Mock

We're replacing behavior with a controlled implementation.

```ts
const mockFn = jest.fn();
```

### Spy

We're observing an existing method.

```ts
jest.spyOn(object, "method");
```

A spy can also be given replacement behavior, so in practice the concepts can overlap.

A useful mental model:

```text
Mock
→ "Let's provide fake behavior."

Spy
→ "Let's watch this existing behavior."
```

---

# 46. `jest.mock()`

`jest.mock()` is used to mock a module.

Suppose:

```text
src/
├── userService.ts
└── emailService.ts
```

Our `userService.ts` might import:

```ts
import { sendEmail } from "./emailService";
```

If we're unit testing `userService`, we might not want to actually send an email.

We can mock the module:

```ts
jest.mock("./emailService");
```

Now Jest can replace that dependency with mocked behavior.

This is a major topic in Jest and TypeScript testing, so we'll want to study it carefully rather than simply memorize the syntax.

---

# 47. `.only`

Sometimes we want to run only one test temporarily.

```ts
test.only("adds numbers", () => {
  expect(2 + 3).toBe(5);
});
```

Jest will focus on that test.

We can also use:

```ts
describe.only(...)
```

But there's an important professional warning:

> **Never accidentally commit `.only` to our repository.**

Otherwise CI may run only one test and skip everything else.

---

# 48. `.skip`

We can temporarily skip a test:

```ts
test.skip("temporary test", () => {
  // ...
});
```

Or:

```ts
describe.skip("some tests", () => {
  // ...
});
```

Useful occasionally, but we shouldn't use skipping as a way to hide broken tests.

---

# 49. `test.todo()`

We can mark future work:

```ts
test.todo("handles expired authentication token");
```

Jest records that we intend to write the test later.

Useful when building a test suite incrementally.

---

# 50. Parameterized Tests

Suppose we want to test many inputs against the same logic.

Instead of:

```ts
test("1 + 1 = 2", ...)
test("2 + 2 = 4", ...)
test("3 + 3 = 6", ...)
```

Jest provides:

```ts
test.each()
```

For example:

```ts
test.each([
  [1, 1, 2],
  [2, 2, 4],
  [3, 3, 6],
])(
  "adds %i + %i = %i",
  (a, b, expected) => {
    expect(a + b).toBe(expected);
  }
);
```

This lets us run the same test logic against multiple datasets.

It's very useful for validation and edge-case testing.

---

# 51. `describe.each()`

We can also parameterize groups:

```ts
describe.each([
  ["admin"],
  ["user"],
  ["guest"],
])("%s role", (role) => {
  test("has a role", () => {
    expect(role).toBeDefined();
  });
});
```

We'll encounter this less frequently than `test.each()`, but it's useful to know.

---

# 52. A Realistic Jest Test

Let's combine what we've learned.

Suppose our application contains:

```ts
export function calculateDiscount(
  price: number,
  percentage: number
) {
  return price - price * percentage;
}
```

Our test:

```ts
describe("calculateDiscount", () => {
  test("applies a 20% discount", () => {
    // Arrange
    const price = 100;
    const discount = 0.2;

    // Act
    const result = calculateDiscount(price, discount);

    // Assert
    expect(result).toBe(80);
  });

  test("returns original price when discount is zero", () => {
    const result = calculateDiscount(100, 0);

    expect(result).toBe(100);
  });

  test("applies 100% discount", () => {
    const result = calculateDiscount(100, 1);

    expect(result).toBe(0);
  });
});
```

Notice how readable this is.

We're essentially documenting the behavior of our function.

---

# 53. A Realistic Async Node.js Test

Suppose:

```ts
async function getUserName(id: string) {
  const user = await getUser(id);

  return user.name;
}
```

We might test:

```ts
describe("getUserName", () => {
  test("returns the user's name", async () => {
    const user = await getUserName("123");

    expect(user).toBe("Skyy");
  });
});
```

And an error:

```ts
test("throws when user doesn't exist", async () => {
  await expect(
    getUserName("unknown")
  ).rejects.toThrow("User not found");
});
```

---

# 54. The Most Important Jest Syntax to Understand First

We don't need to memorize every Jest API immediately.

Our initial core should be:

```text
test()
it()

describe()

expect()

Matchers:
  toBe()
  toEqual()
  toStrictEqual()
  toBeTruthy()
  toBeFalsy()
  toBeNull()
  toBeDefined()
  toBeUndefined()
  toContain()
  toHaveLength()
  toMatch()
  toThrow()

.not

async/await
.resolves
.rejects

beforeEach()
afterEach()
beforeAll()
afterAll()

jest.fn()
jest.spyOn()
jest.mock()
```

Then:

```text
test.only()
test.skip()
test.todo()

test.each()
describe.each()
```

---

# 55. Our Jest Cheat Sheet

Here's the mental reference we'd keep:

| Syntax            | Purpose                 |
| ----------------- | ----------------------- |
| `test()`          | Define a test           |
| `it()`            | Alias of `test()`       |
| `describe()`      | Group related tests     |
| `expect()`        | Start an assertion      |
| `toBe()`          | Strict equality         |
| `toEqual()`       | Deep value comparison   |
| `toStrictEqual()` | Strict deep comparison  |
| `toBeTruthy()`    | Check truthiness        |
| `toBeFalsy()`     | Check falsiness         |
| `toBeNull()`      | Check `null`            |
| `toBeDefined()`   | Not `undefined`         |
| `toContain()`     | Contains value/item     |
| `toHaveLength()`  | Check length            |
| `toMatch()`       | Match string/RegExp     |
| `toThrow()`       | Check thrown error      |
| `.not`            | Negate matcher          |
| `.resolves`       | Test resolved Promise   |
| `.rejects`        | Test rejected Promise   |
| `beforeEach()`    | Run before every test   |
| `afterEach()`     | Run after every test    |
| `beforeAll()`     | Run once before group   |
| `afterAll()`      | Run once after group    |
| `jest.fn()`       | Create mock function    |
| `jest.spyOn()`    | Spy on existing method  |
| `jest.mock()`     | Mock a module           |
| `.only`           | Run only selected tests |
| `.skip`           | Skip selected tests     |
| `test.todo()`     | Mark future test        |
| `test.each()`     | Parameterized tests     |

---

# 56. The Syntax We Should Keep in Our Head

Ultimately, most Jest code can be mentally reduced to:

```ts
describe("WHAT WE ARE TESTING", () => {
  beforeEach(() => {
    // SETUP
  });

  test("EXPECTED BEHAVIOR", async () => {
    // ARRANGE

    // ACT

    // ASSERT
    expect(actual).toEqual(expected);
  });

  afterEach(() => {
    // CLEANUP
  });
});
```

And when dependencies appear:

```text
Our Unit
   │
   ├── Dependency A → Mock
   ├── Dependency B → Mock
   └── Dependency C → Spy
          ↓
       Execute
          ↓
       Assert
```

That is the **core Jest vocabulary** we need.

---
So far, we've learned the syntax:

```ts
test("adds numbers", () => {
  expect(2 + 3).toBe(5);
});
```

But there's an important question underneath:

> **What actually happens when we run `npm test`?**

How does Jest find our `.test.ts` file?
How does Node.js execute TypeScript?
Where does `ts-jest` fit?
What does `jest.config.ts` do?
What changes when we're using ES Modules?
And how does a test go from source code all the way to `PASS` or `FAIL`?

Let's trace the entire process.

---

# 1. The Big Picture First

Suppose our project looks like this:

```text
01-jest-sandbox/
│
├── src/
│   └── calculator.ts
│
├── tests/
│   └── calculator.test.ts
│
├── jest.config.ts
├── package.json
├── tsconfig.json
└── node_modules/
```

Our test contains:

```ts
import { add } from "../src/calculator";

test("adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});
```

We run:

```bash
npm test
```

The overall journey is:

```text
npm test
   ↓
npm
   ↓
package.json
   ↓
jest
   ↓
Jest starts
   ↓
Jest reads configuration
   ↓
Jest discovers test files
   ↓
Jest creates test environment
   ↓
Jest transforms TypeScript
   ↓
Node executes transformed JavaScript
   ↓
test() registers test
   ↓
Jest executes test callback
   ↓
our function runs
   ↓
expect()
   ↓
matcher
   ↓
PASS / FAIL
```

That is the entire system.

Now let's break every stage down.

---

# 2. First: What Happens When We Run `npm test`?

Our `package.json` might contain:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

When we run:

```bash
npm test
```

npm looks inside:

```text
package.json
    ↓
scripts
    ↓
test
    ↓
"jest"
```

So:

```bash
npm test
```

essentially means:

```bash
jest
```

We're not really asking npm to perform testing itself.

We're asking npm:

> "Run the command associated with the `test` script."

And that command launches Jest.

---

# 3. Why Don't We Usually Run `jest` Directly?

We technically can.

For example:

```bash
npx jest
```

or, depending on our setup:

```bash
./node_modules/.bin/jest
```

But normally we use:

```bash
npm test
```

because `package.json` provides a standardized project command.

For example:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

Then our workflow becomes:

```bash
npm test
```

or:

```bash
npm run test:watch
```

or:

```bash
npm run test:coverage
```

---

# 4. What Is Jest Doing When It Starts?

Once Jest starts, it needs to answer:

> **"What tests am I supposed to run?"**

It doesn't blindly execute every `.ts` file in our project.

It performs **test discovery**.

Conceptually:

```text
Project
  ↓
Jest scans files
  ↓
Find files matching test patterns
  ↓
Collect test files
  ↓
Execute them
```

---

# 5. Test Discovery

By default, Jest looks for files that follow common testing conventions.

For example:

```text
something.test.js
something.test.ts
something.spec.js
something.spec.ts
```

So these are commonly recognized:

```text
calculator.test.ts
user.test.ts
auth.test.ts
calculator.spec.ts
user.spec.ts
```

We don't necessarily have to put tests inside a `tests/` folder.

We could do:

```text
src/
├── calculator.ts
├── calculator.test.ts
├── user.ts
└── user.test.ts
```

That's perfectly valid.

---

# 6. `.test.ts` Means What?

When we name a file:

```text
calculator.test.ts
```

we're following a convention that communicates:

```text
calculator
   ↓
this is related to calculator
   ↓
.test
   ↓
this is a test file
   ↓
.ts
   ↓
TypeScript
```

Similarly:

```text
calculator.spec.ts
```

uses `spec` instead of `test`.

`spec` is short for **specification**.

Both conventions are common.

---

# 7. Does `.test.ts` Automatically Make It a Test?

Not by itself.

The filename helps Jest **discover** the file.

But inside the file, we still need actual Jest test definitions:

```ts
test("adds numbers", () => {
  expect(2 + 3).toBe(5);
});
```

So:

```text
.test.ts
   ↓
Jest discovers the file

test()
   ↓
Jest discovers the test inside the file
```

These are two different concepts.

---

# 8. What If We Name It `calculator.ts`?

Suppose:

```text
src/
└── calculator.ts
```

and it contains:

```ts
test("adds numbers", () => {
  expect(2 + 3).toBe(5);
});
```

Jest normally won't consider that file a test file based on its filename.

We can customize discovery through Jest configuration, but the normal convention is:

```text
*.test.ts
```

or:

```text
*.spec.ts
```

---

# 9. Test Discovery Patterns

Jest uses configuration patterns to determine what constitutes a test file.

We may encounter configuration such as:

```ts
testMatch: [
  "**/*.test.ts"
]
```

Meaning roughly:

> Find `.test.ts` files anywhere in the project.

Or:

```ts
testMatch: [
  "**/*.test.ts",
  "**/*.spec.ts"
]
```

Meaning:

> Find both `.test.ts` and `.spec.ts`.

There is also:

```ts
testRegex
```

which allows us to specify regular expressions instead of glob patterns.

For beginners, `testMatch` is easier to understand.

---

# 10. Where Does `jest.config.ts` Come In?

Now we get to:

```text
jest.config.ts
```

This file contains **Jest configuration**.

Think of it as:

```text
jest.config.ts
        ↓
Instructions for Jest
        ↓
"Here is how our project should be tested."
```

For example:

```ts
export default {
  testEnvironment: "node",
};
```

We're telling Jest:

> "Use the Node.js test environment."

---

# 11. Why Do We Need Configuration?

Jest has sensible defaults.

For a simple JavaScript project, we might not need much configuration.

But our Node.js + TypeScript projects introduce questions like:

```text
Where are our tests?
How should TypeScript be transformed?
Are we using ESM?
Which environment should we use?
Should coverage be collected?
Which files should be ignored?
How should modules be mocked?
```

Configuration gives Jest the answers.

---

# 12. A Basic `jest.config.ts`

A basic TypeScript configuration might look conceptually like:

```ts
export default {
  testEnvironment: "node",
};
```

For a Node.js project, that's an important setting.

Why?

Because Jest needs to know what kind of runtime environment our tests should have.

---

# 13. What Is a Test Environment?

A **test environment** is the runtime environment Jest creates for our tests.

For Node.js applications, we generally want:

```text
Node.js environment
```

which is provided by:

```text
jest-environment-node
```

For browser-like testing, we might use:

```text
jest-environment-jsdom
```

This distinction becomes very important when testing React.

---

# 14. Node Environment vs JSDOM

For our current Node.js course:

```text
testEnvironment: "node"
```

makes sense.

It provides Node-style APIs.

For example:

```ts
process
Buffer
Node.js timers
filesystem-related APIs
```

For React:

```text
testEnvironment: "jsdom"
```

gives us a simulated browser environment.

Then things like:

```ts
document
window
HTMLElement
```

can exist.

Conceptually:

```text
Node.js backend
      ↓
testEnvironment: "node"

React frontend
      ↓
testEnvironment: "jsdom"
```

---

# 15. Jest Is Not TypeScript

This distinction is **very important**.

We might have:

```ts
calculator.test.ts
```

But Jest itself doesn't mean:

> "I'm a TypeScript compiler."

Jest's job is primarily:

```text
Find tests
Run tests
Provide assertions
Manage mocks
Report results
```

Something else needs to help Jest deal with TypeScript.

This is where **transformation** comes in.

---

# 16. Why Does TypeScript Need Transformation?

Node.js executes JavaScript.

Our source code is TypeScript:

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

Node.js doesn't natively execute arbitrary TypeScript syntax in the traditional Jest transformation model.

The type annotations:

```ts
: number
```

are TypeScript syntax.

We need to transform:

```text
TypeScript
    ↓
JavaScript
    ↓
Execute
```

For example:

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

becomes conceptually:

```js
function add(a, b) {
  return a + b;
}
```

The transformation step removes or handles TypeScript-specific syntax.

---

# 17. Where Does `ts-jest` Come In?

This is where:

```text
ts-jest
```

comes into the picture.

`ts-jest` is a Jest transformer designed to allow Jest to work with TypeScript.

Conceptually:

```text
calculator.test.ts
        ↓
      ts-jest
        ↓
transformed JavaScript
        ↓
      Jest
        ↓
      Node.js
```

So `ts-jest` acts as a bridge between:

```text
TypeScript
```

and:

```text
Jest's execution pipeline
```

---

# 18. Why Can't Jest Just Run `.ts` Directly?

Because there are multiple layers involved.

Our source contains:

```ts
const age: number = 25;
```

The `: number` annotation isn't runtime JavaScript.

We need something to transform the source into something executable.

This is similar to what happens during a normal TypeScript build:

```text
.ts
 ↓
TypeScript compiler
 ↓
.js
```

With Jest, we want this transformation to happen as part of the testing process.

---

# 19. `ts-jest` vs `tsc`

This distinction is important.

### `tsc`

The TypeScript compiler.

Usually used to compile our project:

```bash
npx tsc
```

Conceptually:

```text
TypeScript
   ↓
JavaScript
```

### `ts-jest`

A Jest transformer.

Conceptually:

```text
TypeScript test/source
        ↓
     ts-jest
        ↓
Jest-compatible JavaScript
```

So they serve related but different purposes.

---

# 20. What Does `ts-jest` Actually Do?

At a high level:

```text
Jest finds calculator.test.ts
              ↓
       Needs to execute it
              ↓
         ts-jest receives it
              ↓
       TypeScript transformation
              ↓
      Jest executes transformed code
```

It allows us to write:

```ts
test("adds numbers", () => {
  expect(add(2, 3)).toBe(5);
});
```

without manually compiling every test file first.

---

# 21. A Common `ts-jest` Configuration

A traditional setup might look like:

```ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
};

export default config;
```

Let's understand it.

---

# 22. `Config`

```ts
import type { Config } from "jest";
```

This imports Jest's TypeScript type describing configuration.

Then:

```ts
const config: Config = {
```

means TypeScript can validate our Jest configuration.

That's useful because VS Code can give us:

* autocomplete
* type checking
* warnings for invalid options

---

# 23. `preset: "ts-jest"`

This is essentially saying:

> "Use the `ts-jest` preset for our Jest setup."

It configures the TypeScript transformation integration.

So:

```ts
preset: "ts-jest"
```

is a convenient way of telling Jest:

```text
Our project uses TypeScript.
Configure ts-jest accordingly.
```

---

# 24. `testEnvironment: "node"`

This says:

```ts
testEnvironment: "node"
```

Our tests run in a Node-like environment.

For our current course:

```text
Node.js + TypeScript
        ↓
testEnvironment: "node"
```

is typically what we want.

---

# 25. Our `tsconfig.json` Still Matters

We might think:

> "Jest has `jest.config.ts`, so why do we need `tsconfig.json`?"

Because they configure **different systems**.

```text
tsconfig.json
      ↓
TypeScript

jest.config.ts
      ↓
Jest
```

They can interact, but they have different responsibilities.

---

# 26. `tsconfig.json`

Our TypeScript configuration controls things such as:

```text
target
module
moduleResolution
strict
esModuleInterop
types
lib
paths
```

For example:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true
  }
}
```

This tells TypeScript how our project is structured and compiled/type-checked.

---

# 27. `jest.config.ts`

Jest configuration controls things such as:

```text
testEnvironment
testMatch
transform
moduleNameMapper
setupFiles
setupFilesAfterEnv
coverage
mock behavior
```

So:

```text
tsconfig.json
→ How TypeScript understands our project

jest.config.ts
→ How Jest understands our tests
```

---

# 28. The ESM Question

Now we reach one of the trickier areas:

> **ES Modules (ESM)**

Modern Node.js applications commonly use:

```ts
import { add } from "./calculator.js";
```

instead of:

```js
const { add } = require("./calculator");
```

We have been modernizing our Node.js projects toward ES Modules, so this is particularly relevant.

---

# 29. CommonJS vs ESM

Historically, Node.js commonly used:

```js
const express = require("express");
```

This is:

```text
CommonJS
```

Modern Node.js can use:

```js
import express from "express";
```

This is:

```text
ES Modules
```

Conceptually:

```text
CommonJS
require()
module.exports

        vs

ESM
import
export
```

Jest needs to understand which module system our project uses.

---

# 30. Why ESM Makes Jest More Complicated

The simple pipeline:

```text
.ts
 ↓
ts-jest
 ↓
CommonJS JavaScript
 ↓
Jest
```

can be relatively straightforward.

But with ESM:

```text
.ts
 ↓
TypeScript/transformer
 ↓
ES module JavaScript
 ↓
Node's ESM loader
 ↓
Jest
```

There are additional rules around:

```text
module
moduleResolution
extensions
imports
exports
Node's ESM loader
Jest's ESM support
```

So ESM + Jest requires more deliberate configuration.

---

# 31. Why Do We Sometimes Write `.js` in TypeScript Imports?

This is something we'll likely encounter with NodeNext.

Suppose our source file is:

```text
src/calculator.ts
```

We may write:

```ts
import { add } from "./calculator.js";
```

even though the source file physically ends in:

```text
.ts
```

Why?

Because Node's ESM runtime ultimately operates on JavaScript files.

TypeScript understands this mapping during compilation/transformation.

This can feel strange initially, but it's an important Node.js ESM convention.

---

# 32. ESM Configuration

An ESM project might have:

```json
{
  "type": "module"
}
```

in `package.json`.

And:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

in `tsconfig.json`.

Now our project is strongly aligned with Node's ESM model.

Jest then needs to be configured consistently with that setup.

---

# 33. `ts-jest` and ESM

With ESM, `ts-jest` has an ESM-specific configuration mode.

Conceptually:

```text
TypeScript
   ↓
ts-jest
   ↓
ESM JavaScript
   ↓
Jest ESM execution
```

rather than:

```text
TypeScript
   ↓
CommonJS JavaScript
   ↓
Jest
```

The exact configuration depends on the versions of:

```text
Node.js
Jest
ts-jest
TypeScript
```

This is one reason Jest + TypeScript tutorials can look different from one another.

---

# 34. Why Version Compatibility Matters

Our setup is a chain:

```text
Node.js
   ↓
Jest
   ↓
ts-jest
   ↓
TypeScript
```

These tools need to cooperate.

For example:

```text
Node 22
Jest 29
ts-jest 29
TypeScript 5.x
```

may have different configuration requirements than:

```text
Node 20
Jest 30
ts-jest newer version
TypeScript newer version
```

So when we follow a tutorial, we shouldn't blindly copy its configuration.

We should look at:

```bash
npm list jest ts-jest typescript
```

and understand which versions we're actually running.

---

# 35. The Complete Pipeline

Let's now connect everything.

Suppose we have:

```text
src/calculator.ts
```

```ts
export function add(a: number, b: number) {
  return a + b;
}
```

And:

```text
src/calculator.test.ts
```

```ts
import { add } from "./calculator.js";

test("adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});
```

Then:

```bash
npm test
```

starts:

```text
                    npm test
                       │
                       ↓
                package.json
                       │
                       ↓
                    "jest"
                       │
                       ↓
                    Jest
                       │
                       ↓
             Read jest.config.ts
                       │
                       ↓
              Discover test files
                       │
                       ↓
        calculator.test.ts discovered
                       │
                       ↓
          Transform TypeScript
                       │
                       ↓
               ts-jest / transformer
                       │
                       ↓
              Executable JavaScript
                       │
                       ↓
              Create test environment
                       │
                       ↓
               Execute test file
                       │
                       ↓
                  test(...)
                       │
                       ↓
              Execute callback
                       │
                       ↓
                   add(2, 3)
                       │
                       ↓
                       5
                       │
                       ↓
                  expect(5)
                       │
                       ↓
                  toBe(5)
                       │
                       ↓
                    PASS ✅
```

That's the core lifecycle.

---

# 36. But There's an Important Detail: Jest Doesn't "Call `test()`"

When Jest loads our test file, our test declaration:

```ts
test("adds numbers", () => {
  ...
});
```

registers a test with Jest.

Think of it like:

```text
Jest loads file
      ↓
test() executes
      ↓
Jest registers:
"Here is a test named adds numbers."
      ↓
Jest later executes that test callback
```

So there are two conceptual phases:

```text
Test registration
        ↓
Test execution
```

This distinction becomes useful when we understand Jest's lifecycle.

---

# 37. Test Registration

When Jest evaluates:

```ts
test("adds numbers", () => {
  expect(2 + 3).toBe(5);
});
```

the callback isn't necessarily executed immediately.

Instead, Jest records:

```text
Test name:
"adds numbers"

Test function:
() => {
  expect(2 + 3).toBe(5);
}
```

Conceptually:

```text
                 test()
                  │
        ┌─────────┴─────────┐
        ↓                   ↓
    Test name          Test callback
        │                   │
        └─────────┬─────────┘
                  ↓
            Jest test registry
```

Then Jest executes the registered tests.

---

# 38. What Happens During Test Execution?

Eventually Jest calls our callback:

```ts
() => {
  const result = add(2, 3);

  expect(result).toBe(5);
}
```

Then our application code runs:

```ts
add(2, 3)
```

and returns:

```text
5
```

Then:

```ts
expect(result)
```

creates an assertion object.

Then:

```ts
.toBe(5)
```

performs the comparison.

---

# 39. What Happens If the Assertion Passes?

We have:

```ts
expect(5).toBe(5);
```

The matcher succeeds.

Jest records:

```text
Test passed
```

Then Jest moves on to the next test.

At the end:

```text
PASS  calculator.test.ts

✓ adds two numbers
```

---

# 40. What Happens If the Assertion Fails?

Suppose our code accidentally returns:

```text
4
```

instead of:

```text
5
```

Our assertion is:

```ts
expect(4).toBe(5);
```

The matcher throws an assertion failure.

Jest catches that failure and records:

```text
Expected: 5
Received: 4
```

Then:

```text
FAIL ❌
```

Jest continues according to its test execution behavior and eventually reports the suite failure.

---

# 41. A Test Failure Is Not Necessarily a Code Error

This distinction is important.

Suppose:

```ts
function add(a: number, b: number) {
  return a - b;
}
```

and our test says:

```ts
expect(add(2, 3)).toBe(5);
```

Jest reports failure.

But Jest isn't necessarily "broken."

Our test is telling us:

```text
Expected behavior ≠ Actual behavior
```

The problem could be:

```text
Our application code
       OR
Our test expectation
       OR
Our test setup
       OR
Our mocking
       OR
Our configuration
```

Tests tell us there is a mismatch.

We then investigate.

---

# 42. Test Suite vs Test Case

We'll frequently see these terms.

### Test case

One individual test:

```ts
test("adds numbers", () => {
  ...
});
```

### Test suite

A collection of related tests, often grouped with `describe()`:

```ts
describe("calculator", () => {
  test("adds numbers", () => {});
  test("subtracts numbers", () => {});
  test("multiplies numbers", () => {});
});
```

So:

```text
Test Suite
│
├── Test Case
├── Test Case
└── Test Case
```

---

# 43. Test File vs Test Suite vs Test Case

These terms can be confusing at first.

Suppose:

```text
calculator.test.ts
```

contains:

```ts
describe("calculator", () => {
  test("adds", () => {});
  test("subtracts", () => {});
});
```

Then:

```text
Test File
   ↓
calculator.test.ts

Test Suite
   ↓
describe("calculator")

Test Cases
   ↓
test("adds")
test("subtracts")
```

Jest executes all of these as part of the overall test run.

---

# 44. Where `beforeEach()` Fits Into the Lifecycle

Suppose:

```ts
describe("UserService", () => {
  beforeEach(() => {
    setup();
  });

  test("creates user", () => {});
  test("updates user", () => {});
});
```

The conceptual lifecycle is:

```text
Load test file
      ↓
Register describe/test hooks
      ↓
Run beforeEach()
      ↓
Run test #1
      ↓
Run beforeEach()
      ↓
Run test #2
      ↓
Finish suite
```

This becomes extremely important when we introduce mocks.

---

# 45. Where `afterEach()` Fits

For example:

```ts
afterEach(() => {
  jest.clearAllMocks();
});
```

Then:

```text
beforeEach
    ↓
test
    ↓
afterEach
```

This lets us keep tests isolated.

---

# 46. Where `beforeAll()` Fits

If we have:

```ts
beforeAll(() => {
  connectToSomething();
});
```

then conceptually:

```text
beforeAll
    ↓
test 1
test 2
test 3
    ↓
afterAll
```

This is useful for expensive one-time setup.

However, with unit tests, we should avoid unnecessary global/shared state because it can make tests less independent.

---

# 47. What Is a Test Environment Really Doing?

It's useful to think of the environment as the world in which our test executes.

For Node:

```text
Node test environment
```

For browser-style testing:

```text
JSDOM environment
```

Jest creates the necessary environment before executing the test.

Conceptually:

```text
Jest
 ↓
Create environment
 ↓
Load test code
 ↓
Execute test
 ↓
Tear down environment
```

This is one reason Jest can provide globals such as:

```ts
test()
expect()
describe()
```

without us explicitly importing them in the traditional Jest setup.

---

# 48. Where Do `test()` and `expect()` Come From?

In a standard Jest setup, we can write:

```ts
test(...)
expect(...)
describe(...)
```

without:

```ts
import { test, expect, describe } from "@jest/globals";
```

Why?

Jest exposes these APIs in the test environment.

TypeScript may still need the Jest type definitions:

```text
@types/jest
```

so that VS Code/TypeScript understands:

```ts
test()
expect()
describe()
```

---

# 49. What Is `@types/jest`?

This is another package worth understanding.

```text
@types/jest
```

provides TypeScript type definitions for Jest.

It helps TypeScript understand:

```ts
test()
describe()
expect()
beforeEach()
jest.fn()
```

and their types.

Important:

> `@types/jest` does not run our tests.

It provides **types**.

Think:

```text
@types/jest
     ↓
TypeScript understands Jest APIs
```

while:

```text
jest
     ↓
Actually runs Jest tests
```

---

# 50. `jest` vs `@types/jest` vs `ts-jest`

This is a very useful distinction.

```text
jest
 ↓
Testing framework / test runner

@types/jest
 ↓
TypeScript definitions for Jest APIs

ts-jest
 ↓
Transforms TypeScript for Jest
```

So:

```text
           Jest
             │
      ┌──────┴──────┐
      ↓             ↓
 @types/jest      ts-jest
      ↓             ↓
 TypeScript      TypeScript
 understands     can be
 Jest APIs       transformed
```

---

# 51. Why `npm test` Can Find Jest

When we install Jest:

```bash
npm install -D jest
```

npm puts it into:

```text
node_modules/
```

Our `package.json` says:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

When npm executes scripts, it makes local binaries from `node_modules/.bin` available.

So:

```bash
npm test
```

can find our project's local Jest executable.

This is preferable to relying on some globally installed Jest version.

---

# 52. Why Local Dependencies Matter

Imagine:

```text
Our project → Jest 29
Another project → Jest 30
```

If we relied on a globally installed Jest:

```text
global Jest
```

we could accidentally run the wrong version.

Using:

```text
node_modules/.bin/jest
```

means our project controls its own tooling version.

That's one reason package managers and `package.json` are important.

---

# 53. The Role of `package-lock.json`

Our package manager records dependency versions and resolution information.

For example:

```text
package.json
     ↓
Allowed dependency ranges

lockfile
     ↓
Specific resolved dependency tree
```

So when we clone our project on another machine, the intended dependency versions can be reproduced much more reliably.

This matters for testing because we want:

```text
Developer machine
      ≈
CI server
      ≈
Other developer machine
```

rather than everyone running different Jest versions.

---

# 54. What Happens When We Import Our Application Code?

Our test might say:

```ts
import { add } from "./calculator.js";
```

Jest needs to resolve that module.

Conceptually:

```text
calculator.test.ts
       ↓
import "./calculator.js"
       ↓
Module resolution
       ↓
Find corresponding module
       ↓
Transform if necessary
       ↓
Execute module
       ↓
Export add()
       ↓
Test uses add()
```

This is another place where ESM configuration matters.

---

# 55. Why Module Resolution Matters

Our TypeScript configuration might contain:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

This tells TypeScript:

> "Follow Node's modern module-resolution rules."

Jest and its transformer need to work consistently with those rules.

If they don't, we can get errors such as:

```text
Cannot find module
Unexpected token
Cannot use import statement outside a module
```

These errors often aren't really about our test logic.

They're **toolchain/configuration errors**.

---

# 56. Two Different Categories of Jest Problems

This is a very useful debugging distinction.

### Test failure

Example:

```text
Expected: 5
Received: 4
```

Our test ran successfully.

Our behavior didn't match the expectation.

---

### Test environment/configuration failure

Example:

```text
SyntaxError: Cannot use import statement outside a module
```

Our test might not even have executed.

The Jest/Node/TypeScript module system isn't configured correctly.

So:

```text
FAILURE
│
├── Test failure
│     ↓
│   Our behavior/expectation
│
└── Configuration/runtime failure
      ↓
    Toolchain/setup
```

Learning to distinguish these will save us a lot of debugging time.

---

# 57. The Complete Lifecycle in One Diagram

Here's the model I'd keep:

```text
                    npm test
                       │
                       ↓
                 package.json
                       │
                       ↓
                  Jest starts
                       │
                       ↓
              Read Jest config
                       │
                       ↓
               Test discovery
                       │
                       ↓
             Find *.test.ts files
                       │
                       ↓
              Load test module
                       │
                       ↓
          TypeScript transformation
                       │
                  ts-jest
                       │
                       ↓
             Executable JS/ESM
                       │
                       ↓
             Create test environment
                       │
                       ↓
             Register test suites
                       │
                       ↓
               Register test cases
                       │
                       ↓
                beforeAll()
                       │
                       ↓
                beforeEach()
                       │
                       ↓
                 Execute test
                       │
                       ↓
                Our code runs
                       │
                       ↓
                  expect()
                       │
                       ↓
                  matcher
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
          PASS ✅             FAIL ❌
             │                   │
             └─────────┬─────────┘
                       ↓
                  afterEach()
                       │
                       ↓
                   next test
                       │
                       ↓
                  afterAll()
                       │
                       ↓
                Jest report
                       │
                       ↓
              Process exit code
```

That last piece—**process exit code**—is important for CI/CD.

---

# 58. Jest's Exit Code

When everything passes:

```text
exit code = 0
```

This tells the operating system:

> "The command succeeded."

If tests fail:

```text
exit code ≠ 0
```

This tells the operating system:

> "Something went wrong."

Why does this matter?

Because CI/CD systems can use it.

For example:

```text
Git push
   ↓
CI runs npm test
   ↓
Jest
   ↓
PASS
   ↓
Continue deployment
```

But:

```text
Git push
   ↓
CI runs npm test
   ↓
Jest
   ↓
FAIL
   ↓
Stop pipeline ❌
```

This is how testing eventually connects to professional development workflows.

---

# 59. What About Watch Mode?

We can run:

```bash
npm test -- --watch
```

or define:

```json
{
  "scripts": {
    "test:watch": "jest --watch"
  }
}
```

Then:

```bash
npm run test:watch
```

Jest monitors our files.

Conceptually:

```text
Change calculator.ts
        ↓
Jest notices
        ↓
Relevant tests run
        ↓
Results appear
```

This gives us a very productive development loop:

```text
Code
 ↓
Test
 ↓
Change
 ↓
Automatic test
 ↓
Fix
 ↓
Repeat
```

---

# 60. Watch Mode Is Not Magic

Jest tries to determine which tests are relevant to our changes.

For example:

```text
Changed:
calculator.ts
```

Jest can identify tests related to:

```text
calculator.test.ts
```

and rerun them.

For larger projects, this can save considerable time.

---

# 61. Coverage

We can ask Jest for coverage:

```bash
npm test -- --coverage
```

or:

```json
{
  "scripts": {
    "test:coverage": "jest --coverage"
  }
}
```

Then Jest instruments our code and produces metrics such as:

```text
Statements
Branches
Functions
Lines
```

Conceptually:

```text
Our source code
      ↓
Coverage instrumentation
      ↓
Run tests
      ↓
Track executed code
      ↓
Generate coverage report
```

Again:

```text
Coverage ≠ correctness
```

It tells us what code was exercised, not whether the tests were good.

---

# 62. One More Important Concept: Transformation ≠ Compilation for Production

When Jest transforms:

```text
calculator.test.ts
```

using `ts-jest`, that's primarily for **test execution**.

We shouldn't think:

> "Jest has built our production application."

It hasn't.

Production builds and test execution are separate concerns.

We might have:

```text
Development/production:
tsc / bundler / build tool
       ↓
production JavaScript
```

while:

```text
Testing:
Jest
 ↓
transformer
 ↓
test execution
```

---

# 63. Why Modern Jest Setups Can Look Different

If we look at different tutorials, we might see:

### Setup A

```ts
preset: "ts-jest"
```

### Setup B

```ts
transform: {
  "^.+\\.tsx?$": ["ts-jest", {}]
}
```

### Setup C

A Babel-based transformer.

### Setup D

Another TypeScript runtime/transformer approach.

These aren't necessarily contradictory.

They're different ways of creating the pipeline:

```text
TypeScript
    ↓
Something transforms it
    ↓
Jest executes it
```

The exact mechanism depends on our project's requirements and versions.

---

# 64. Why We Shouldn't Blindly Copy Jest Configurations

This is especially important while learning.

Suppose a tutorial gives us:

```ts
preset: "ts-jest"
```

But our project is:

```text
Node 22
ESM
TypeScript NodeNext
Jest 29
```

We need to ask:

```text
Is this configuration intended for CommonJS?
Is it intended for ESM?
Which Jest version?
Which ts-jest version?
Which TypeScript version?
```

Otherwise we can end up debugging configuration problems that have nothing to do with our actual testing knowledge.

---

# 65. Our Current Project's Likely Architecture

Since we're working through a **Node.js + TypeScript + Jest** course, a clean conceptual structure could be:

```text
01-jest-sandbox/
│
├── src/
│   ├── calculator.ts
│   ├── user.ts
│   └── utils.ts
│
├── tests/
│   ├── calculator.test.ts
│   ├── user.test.ts
│   └── utils.test.ts
│
├── jest.config.ts
├── tsconfig.json
├── package.json
└── package-lock.json
```

Or colocated tests:

```text
src/
├── calculator.ts
├── calculator.test.ts
├── user.ts
└── user.test.ts
```

Both approaches are valid.

The important thing is that Jest's discovery rules match our structure.

---

# 66. Let's Trace One Actual Test

Suppose:

### `calculator.ts`

```ts
export function add(a: number, b: number) {
  return a + b;
}
```

### `calculator.test.ts`

```ts
import { add } from "./calculator.js";

describe("add", () => {
  test("adds two numbers", () => {
    const result = add(2, 3);

    expect(result).toBe(5);
  });
});
```

We execute:

```bash
npm test
```

Now:

### Step 1 — npm

```text
npm test
```

looks at:

```json
"test": "jest"
```

and launches Jest.

---

### Step 2 — Jest starts

Jest initializes itself.

---

### Step 3 — Configuration

Jest looks for configuration such as:

```text
jest.config.ts
```

and loads the relevant options.

---

### Step 4 — Discovery

Jest searches for files matching its test patterns.

It finds:

```text
calculator.test.ts
```

---

### Step 5 — Transformation

The test is TypeScript.

The configured transformer, such as `ts-jest`, processes it.

---

### Step 6 — Environment

Jest creates the configured Node environment.

---

### Step 7 — Module loading

Jest loads:

```text
calculator.test.ts
```

The test imports:

```text
calculator.js
```

Jest resolves and loads our application module through the configured module system/transformer.

---

### Step 8 — Test registration

This executes:

```ts
describe(...)
```

and:

```ts
test(...)
```

Jest registers the test.

---

### Step 9 — Test execution

Jest runs:

```ts
() => {
  const result = add(2, 3);

  expect(result).toBe(5);
}
```

---

### Step 10 — Application code

Our function executes:

```ts
add(2, 3)
```

Result:

```text
5
```

---

### Step 11 — Assertion

Jest evaluates:

```ts
expect(5).toBe(5);
```

The matcher succeeds.

---

### Step 12 — Result

Jest records:

```text
PASS
```

---

### Step 13 — Report

We see something like:

```text
PASS  src/calculator.test.ts

✓ adds two numbers
```

And if all tests pass, Jest exits successfully.

That's the complete journey.

---

# 67. The Three Layers We Should Never Confuse

This is probably the most useful conceptual takeaway from this entire explanation.

Our setup has three major layers:

```text
                    OUR CODE
                       │
              ┌────────┴────────┐
              ↓                 ↓
         TypeScript            Tests
              │                 │
              ↓                 ↓
          TypeScript          Jest
          compiler/           runner
          transformer
              │                 │
              └────────┬────────┘
                       ↓
                  Node.js runtime
```

More specifically:

### Layer 1 — TypeScript

Answers:

> "Does our code follow TypeScript's type rules, and how should TypeScript be transformed?"

### Layer 2 — Jest

Answers:

> "Which tests should we run, how do we execute them, and did their assertions pass?"

### Layer 3 — Node.js

Answers:

> "Can the resulting JavaScript/module system actually execute?"

When something goes wrong, identifying the layer is half the debugging process.

---

# 68. Our Mental Model Going Forward

I'd recommend remembering this:

```text
             npm test
                 ↓
              Jest
                 ↓
        ┌─────────────────┐
        │ Read config     │
        │ Discover tests   │
        │ Create env       │
        └────────┬────────┘
                 ↓
          TypeScript file
                 ↓
            Transformer
            (ts-jest)
                 ↓
          Executable code
                 ↓
         Register tests
                 ↓
         Execute lifecycle
                 ↓
          Run our code
                 ↓
             expect()
                 ↓
             matcher
                 ↓
          PASS / FAIL
                 ↓
          Jest report
                 ↓
            Exit code
```

Once we understand this pipeline, Jest stops feeling like a collection of mysterious commands.

`test()` isn't magic.

`expect()` isn't magic.

`jest.fn()` isn't magic.

`jest.config.ts` isn't magic.

They're pieces of a **test execution system**.

---

## The most important distinctions to remember

```text
.test.ts
   ↓
Test file naming/discovery

jest.config.ts
   ↓
Jest configuration

tsconfig.json
   ↓
TypeScript configuration

jest
   ↓
Test runner/framework

@types/jest
   ↓
TypeScript definitions

ts-jest
   ↓
TypeScript ↔ Jest transformation bridge

testEnvironment
   ↓
Runtime environment for tests

test()
   ↓
Defines a test case

expect()
   ↓
Creates an assertion

matcher
   ↓
Defines how we compare/check

PASS
   ↓
Expected behavior matched

FAIL
   ↓
Expected behavior didn't match
```

And the **single most important pipeline** to keep in our head is:

```text
                 npm test
                     ↓
                  Jest
                     ↓
             Read configuration
                     ↓
              Discover tests
                     ↓
           Transform TypeScript
                     ↓
             Create environment
                     ↓
             Load test modules
                     ↓
             Register test cases
                     ↓
             Execute test cases
                     ↓
                Our code
                     ↓
                 expect()
                     ↓
                Matcher
                     ↓
              PASS / FAIL
                     ↓
                Jest report
```
---





