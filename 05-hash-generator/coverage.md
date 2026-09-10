# Test Coverage in Jest — Deep Explanation

Test coverage is one of the most important concepts we should understand after learning how to write tests.

The simplest definition is:

> **Test coverage tells us how much of our application's code was actually executed while our tests were running.**

But there is an important distinction:

> **Coverage tells us what code our tests executed; it does not prove that our tests are good or that the code is correct.**

Our `HashGenerator` example is perfect for understanding this.

---

# 1. Why do we need test coverage?

Suppose we have this function:

```ts
function calculatePrice(price: number, discount: number) {
  if (discount > 0) {
    return price - discount;
  }

  return price;
}
```

And we write:

```ts
test("should calculate price", () => {
  expect(calculatePrice(100, 20)).toBe(80);
});
```

Our test executes:

```text
calculatePrice(100, 20)
        │
        ▼
discount > 0
        │
        ▼
      TRUE
        │
        ▼
price - discount
```

But we never tested:

```ts
discount <= 0
```

So this code:

```ts
return price;
```

was never executed.

Without coverage, we might not notice that.

Coverage gives us a report showing which portions of our code were exercised.

---

# 2. Running Jest with coverage

In our project we have:

```bash
npm run test:cov
```

which runs:

```bash
jest --coverage
```

So instead of:

```bash
npm test
```

we run:

```bash
npm run test:cov
```

Jest runs our tests and then instruments the code to determine which parts were executed.

Our output was:

```text
------------------|---------|----------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines
------------------|---------|----------|---------|-------------------
All files         |     100 |      100 |     100 |
HashGenerator.ts  |     100 |      100 |     100 |
------------------|---------|----------|---------|-------------------
```

That gives us several different coverage measurements.

---

# 3. The four major coverage metrics

Jest/Istanbul reports four major categories:

```text
Statements
Branches
Functions
Lines
```

We need to understand the difference between all four.

---

# 4. Statement coverage

**Statement coverage** asks:

> **Which executable statements were executed by our tests?**

Consider:

```ts
function greet(name: string) {
  const message = `Hello ${name}`;
  console.log(message);

  return message;
}
```

We have several executable statements:

```ts
const message = `Hello ${name}`;
console.log(message);
return message;
```

If our test calls:

```ts
greet("John");
```

all of those statements execute.

So we'd get:

```text
Statements: 100%
```

---

## Example of incomplete statement coverage

Suppose:

```ts
function calculate(value: number) {
  const doubled = value * 2;

  if (value > 10) {
    console.log("Large value");
  }

  return doubled;
}
```

If we test:

```ts
calculate(20);
```

the `console.log()` statement executes.

But suppose we had:

```ts
if (value > 10) {
  console.log("Large value");
}

if (value < 0) {
  console.log("Negative");
}
```

and only tested:

```ts
calculate(20);
```

The negative branch's statement would never execute.

Coverage could therefore be less than 100%.

---

# 5. Branch coverage

Branch coverage is slightly more sophisticated.

It asks:

> **Have our tests executed every possible branch of conditional logic?**

Consider:

```ts
function getMessage(age: number) {
  if (age >= 18) {
    return "Adult";
  } else {
    return "Minor";
  }
}
```

There are two branches:

```text
if age >= 18
      │
   ┌──┴──┐
 TRUE   FALSE
   │       │
   ▼       ▼
Adult    Minor
```

If we only test:

```ts
getMessage(20);
```

we execute:

```text
TRUE
```

but never:

```text
FALSE
```

So branch coverage isn't 100%.

We need something like:

```ts
expect(getMessage(20)).toBe("Adult");
expect(getMessage(15)).toBe("Minor");
```

Now both branches execute.

---

# 6. Why branch coverage matters

Consider this:

```ts
function processUser(user?: User) {
  if (user) {
    return user.name;
  }

  return "Unknown";
}
```

We have:

```text
user exists
    │
 ┌──┴──┐
YES    NO
 │      │
 ▼      ▼
name   Unknown
```

A good test suite should exercise both.

```ts
test("existing user", () => {
  expect(processUser({ name: "John" })).toBe("John");
});

test("missing user", () => {
  expect(processUser()).toBe("Unknown");
});
```

Now our tests demonstrate both behaviors.

---

# 7. Branches aren't only `if/else`

Branch coverage can involve many forms of conditional logic.

### `if`

```ts
if (condition) {}
```

### `if/else`

```ts
if (condition) {
} else {
}
```

### Ternary

```ts
const result = condition ? "yes" : "no";
```

### Logical conditions

Depending on instrumentation/configuration, expressions involving logical operators can create branch coverage considerations:

```ts
const result = user && user.name;
```

### `switch`

```ts
switch (role) {
  case "admin":
    break;

  case "user":
    break;

  default:
    break;
}
```

So branch coverage is essentially concerned with **different execution paths** through conditional logic.

---

# 8. Function coverage

Function coverage asks:

> **Which functions were actually called by our tests?**

Suppose:

```ts
function add(a: number, b: number) {
  return a + b;
}

function subtract(a: number, b: number) {
  return a - b;
}
```

If our tests only call:

```ts
add(2, 3);
```

then:

```text
add       → called
subtract  → not called
```

Function coverage would therefore be incomplete.

If we also test:

```ts
subtract(5, 2);
```

both functions have been executed.

---

# 9. Function coverage doesn't mean functions are correctly tested

This distinction is important.

Suppose:

```ts
function add(a: number, b: number) {
  return a + b;
}
```

Our test could simply do:

```ts
test("add", () => {
  add(10, 20);
});
```

The function executes.

Therefore function coverage can count it as covered.

But we didn't assert anything!

We didn't verify:

```ts
expect(add(10, 20)).toBe(30);
```

So:

```text
Function executed ≠ Function correctly tested
```

This is one of the most important principles of coverage.

---

# 10. Line coverage

Line coverage asks:

> **Which executable lines were executed?**

For example:

```ts
function add(a: number, b: number) {
  const result = a + b;
  console.log(result);

  return result;
}
```

If our test executes the function, all those lines execute.

So we get high line coverage.

---

# 11. Statement coverage vs line coverage

These two are very similar, but they aren't exactly the same concept.

Consider:

```ts
const a = 10; const b = 20;
```

That's one physical line containing two statements.

We can have:

```text
1 line
2 statements
```

So:

```text
Line coverage
```

and:

```text
Statement coverage
```

can theoretically differ.

That's why coverage tools report them separately.

A useful mental model:

```text
Line coverage
    ↓
Did we execute this physical line?

Statement coverage
    ↓
Did we execute each executable statement?
```

---

# 12. Applying all four metrics to our `HashGenerator`

Now let's look at our actual implementation:

```ts
export class HashGenerator {
  private hashSalt: string;

  private constructor(hashSalt: string) {
    this.hashSalt = hashSalt;
  }

  static createHashGenerator(hashSalt: string): HashGenerator {
    return new HashGenerator(hashSalt);
  }

  public generateHash(input: string): string {
    return this.makeUrlSafe(
      Buffer.from(
        createHmac('sha256', this.hashSalt)
          .update(input)
          .digest('base64')
      ).toString()
    );
  }

  private makeUrlSafe(str: string): string {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}
```

There are no:

```ts
if
else
switch
for
while
```

or other explicit conditional paths.

Therefore our **branch coverage is easy to achieve**.

---

# 13. Our 100% statements

Our coverage says:

```text
Statements: 100%
```

That means the executable statements in `HashGenerator.ts` were executed during our tests.

For example:

```ts
this.hashSalt = hashSalt;
```

was executed because our tests created instances.

This:

```ts
return new HashGenerator(hashSalt);
```

was executed by:

```ts
HashGenerator.createHashGenerator(testSalt);
```

This:

```ts
createHmac(...)
```

was executed whenever:

```ts
generateHash(...)
```

was called.

And:

```ts
return str.replace(...)
```

was executed whenever the hash was generated.

---

# 14. Our 100% functions

Our coverage says:

```text
Functions: 100%
```

Our class has several functions/methods:

```text
constructor
createHashGenerator()
generateHash()
makeUrlSafe()
```

Our tests cause these to execute.

For example:

```ts
HashGenerator.createHashGenerator(testSalt);
```

causes:

```text
createHashGenerator()
       ↓
constructor()
```

And:

```ts
hashGenerator.generateHash(randInput);
```

causes:

```text
generateHash()
      ↓
makeUrlSafe()
```

Therefore all measured functions are executed.

---

# 15. Our 100% branches

Our implementation has essentially no explicit conditional branches.

This:

```ts
return str
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');
```

doesn't create an `if/else` branch.

So our tests can easily reach:

```text
Branch coverage = 100%
```

This is an important warning:

> **100% branch coverage on a simple implementation does not necessarily mean we've tested every meaningful input scenario.**

---

# 16. Our 100% lines

Every executable line in `HashGenerator.ts` gets executed.

That's why:

```text
Lines = 100%
```

---

# 17. What the coverage report is really telling us

Our report:

```text
HashGenerator.ts | 100 | 100 | 100 | 100
```

should be read as:

```text
100% of measured statements executed
100% of measured branches executed
100% of measured functions executed
100% of measured lines executed
```

It should **not** be interpreted as:

```text
100% bug-free
100% correct
100% tested
100% production-ready
```

Those are completely different claims.

---

# 18. The difference between coverage and assertions

This is probably the most important distinction to remember.

Imagine:

```ts
function divide(a: number, b: number) {
  return a / b;
}
```

Our test:

```ts
test("divide", () => {
  divide(10, 2);
});
```

executes the function.

Therefore:

```text
Function coverage → 100%
Line coverage     → 100%
```

But our test doesn't verify the result.

A much better test is:

```ts
test("should divide two numbers", () => {
  expect(divide(10, 2)).toBe(5);
});
```

Now we're both:

```text
executing the code
        +
checking its behavior
```

That's what we want.

---

# 19. High coverage + weak assertions = bad testing

We could technically write:

```ts
test("HashGenerator", () => {
  const generator =
    HashGenerator.createHashGenerator("secret");

  generator.generateHash("hello");
});
```

Maybe that gets us excellent coverage.

But what have we actually proven?

Almost nothing.

We haven't checked:

```text
Is the result a string?
Is it deterministic?
Does the input affect the result?
Does the secret affect the result?
Is it URL-safe?
Does empty input work?
```

Our existing tests are much better because they make actual assertions.

---

# 20. Coverage is a feedback mechanism

Think of coverage as a flashlight.

Our code:

```text
────────────────────────────
Application code
────────────────────────────
```

Our tests shine light on parts of it:

```text
████████████████████████████
tested/executed
```

If we have:

```text
████████████░░░░░░░░
```

coverage tells us:

> Some code isn't being reached by our tests.

Then we investigate.

Maybe there's an untested:

```ts
catch
```

or:

```ts
else
```

or:

```ts
switch case
```

or:

```ts
error condition
```

Coverage therefore helps us **find testing gaps**.

---

# 21. Coverage is not a target to blindly maximize

This is where beginners sometimes go wrong.

They think:

```text
80% → bad
90% → better
100% → perfect
```

That's not how we should think about it.

Suppose we have:

```ts
function calculateTax() {
   // 300 lines
}
```

and we write meaningless tests just to reach 100%.

That's worse than having:

```text
85%
```

with strong tests that verify the important business behavior.

The goal isn't:

> "Make the coverage number 100."

The goal is:

> **Use coverage to identify untested code, then decide whether that code actually needs meaningful tests.**

---

# 22. Why 100% coverage can still miss bugs

Consider:

```ts
function getDiscount(price: number) {
  if (price > 1000) {
    return 100;
  }

  return 10;
}
```

Suppose we test:

```ts
expect(getDiscount(2000)).toBe(100);
expect(getDiscount(500)).toBe(10);
```

Great.

We exercise both branches.

Now imagine someone accidentally changes:

```ts
if (price > 1000)
```

to:

```ts
if (price >= 1000)
```

Our existing tests still pass:

```text
2000 → 100
500  → 10
```

and coverage can still be:

```text
100%
```

But there's a boundary bug.

We needed:

```ts
expect(getDiscount(1000)).toBe(10);
```

or whatever the business rule actually requires.

This demonstrates:

> **Coverage measures execution, not the quality of our test cases.**

---

# 23. Coverage and edge cases

This is why our HashGenerator test:

```ts
test("should handle empty input", () => {
  const hashGenerator =
    HashGenerator.createHashGenerator(testSalt);

  expect(() =>
    hashGenerator.generateHash("")
  ).not.toThrow();
});
```

is useful.

Coverage might already have been 100% without this exact test because another call to `generateHash()` executes the same lines.

But this test checks a **specific behavior**.

That's the difference between:

```text
code coverage
```

and:

```text
behavioral coverage
```

Our coverage tool doesn't know that:

```text
""
```

is an important edge case.

We do.

---

# 24. Code coverage vs requirement coverage

This is another useful distinction.

Imagine our requirements are:

```text
Requirement 1:
Create a HashGenerator.

Requirement 2:
Generate deterministic hashes.

Requirement 3:
Different inputs produce different hashes.

Requirement 4:
Different secrets produce different hashes.

Requirement 5:
Output must be URL-safe.

Requirement 6:
Empty input must be supported.
```

We can have:

```text
Code coverage: 100%
```

but accidentally forget requirement 2.

That's why our recommended test:

```ts
same input + same salt → same hash
```

is important.

Coverage tools don't understand business requirements.

---

# 25. Coverage thresholds

Jest can also enforce minimum coverage.

For example, we can configure:

```ts
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

Conceptually:

```text
Statements ≥ 80%
Branches   ≥ 80%
Functions  ≥ 80%
Lines      ≥ 80%
```

If coverage falls below the threshold, Jest can fail the test command.

This is useful in CI/CD.

For example:

```text
Developer pushes code
        ↓
CI runs Jest
        ↓
Tests pass
        ↓
Coverage calculated
        ↓
Coverage ≥ threshold?
      /       \
    YES        NO
     │          │
   PASS        FAIL
```

---

# 26. Why teams use coverage thresholds

Suppose our project starts with:

```text
Coverage = 85%
```

Then someone adds a large feature without tests.

Now:

```text
Coverage = 68%
```

Without a threshold, the project can gradually accumulate untested code.

A threshold gives us a safety mechanism:

```text
Minimum acceptable coverage
          ↓
        80%
```

But again, the number is a policy, not a universal law.

Different projects can reasonably choose different thresholds.

---

# 27. Coverage reports and uncovered lines

Our output included:

```text
Uncovered Line #s
```

When coverage isn't 100%, Jest can show us the lines that weren't executed.

For example:

```text
Uncovered Line #s
12, 18-20
```

That tells us:

```text
Line 12 wasn't executed
Lines 18–20 weren't executed
```

We can then inspect those lines and determine:

```text
Is this an actual missing test?
Is this unreachable code?
Is this intentionally excluded code?
Should we change the implementation?
```

---

# 28. HTML coverage reports

When we run:

```bash
npm run test:cov
```

Jest generally creates a:

```text
coverage/
```

directory.

Inside it we can typically find an HTML report.

The HTML report lets us visually inspect our source and see which lines/branches were covered.

Conceptually:

```text
HashGenerator.ts

████████████████████  covered
████████████████████  covered
████████████████████  covered
████████████████████  covered
```

If something is missing:

```text
████████████████████
████████░░░░░░░░░░░░
```

we can investigate exactly where the testing gap is.

---

# 29. Why we added `coverage/` to `.gitignore`

This connects directly to the `.gitignore` discussion we had.

Our root `.gitignore` can contain:

```gitignore
node_modules/
coverage/
```

Why?

Because:

```text
node_modules/
```

contains installed dependencies.

And:

```text
coverage/
```

contains generated test reports.

Neither should normally be committed to Git.

We can regenerate coverage whenever we run:

```bash
npm run test:cov
```

---

# 30. Coverage in a real development workflow

A good workflow is:

```text
1. Write implementation
        ↓
2. Write meaningful tests
        ↓
3. Run tests
        ↓
4. Run coverage
        ↓
5. Inspect uncovered code
        ↓
6. Determine whether behavior is missing
        ↓
7. Add meaningful tests
        ↓
8. Refactor if necessary
        ↓
9. Run tests + coverage again
```

Not:

```text
Write random tests
      ↓
Get 100%
      ↓
Done
```

---

# 31. Coverage in CI/CD

In a professional project, this can become:

```text
                    Git push
                       │
                       ▼
                    CI/CD
                       │
                ┌──────┴──────┐
                ▼             ▼
             Tests         Coverage
                │             │
                └──────┬──────┘
                       ▼
                 Quality checks
                       │
                ┌──────┴──────┐
                ▼             ▼
              Pass           Fail
                │
                ▼
          Build / Deploy
```

For example:

```text
Tests:       245 passed
Statements:  91%
Branches:    87%
Functions:   94%
Lines:       92%
```

A CI pipeline can enforce project-specific minimums.

---

# 32. Coverage is especially useful when our codebase grows

With a tiny class like:

```ts
HashGenerator
```

we can manually inspect everything.

But imagine:

```text
src/
├── controllers/
├── services/
├── repositories/
├── middleware/
├── utils/
├── validators/
└── modules/
```

with hundreds of files.

We can't manually remember every untested path.

Coverage gives us a map:

```text
services/UserService.ts       95%
services/AuthService.ts       72%
services/PaymentService.ts    43%
middleware/auth.ts            91%
utils/hash.ts                100%
```

Now we immediately know:

```text
PaymentService.ts
```

deserves investigation.

---

# 33. Four metrics — final comparison

| Metric         | Question                                                |
| -------------- | ------------------------------------------------------- |
| **Statements** | Did our tests execute the executable statements?        |
| **Branches**   | Did our tests exercise the different conditional paths? |
| **Functions**  | Did our tests call the functions/methods?               |
| **Lines**      | Did our tests execute the executable source lines?      |

A useful memory trick:

```text
Statements → Did the code execute?
Branches   → Did the paths execute?
Functions  → Did the functions execute?
Lines      → Did the lines execute?
```

---

# 34. Coverage vs correctness

We should keep these separate in our mental model:

```text
                 TEST QUALITY
                      │
          ┌───────────┴───────────┐
          │                       │
      Coverage                 Assertions
          │                       │
    "Did code run?"        "Did behavior work?"
```

Good testing combines both.

We want:

```text
High meaningful coverage
          +
Strong assertions
          +
Good edge cases
          +
Good requirement coverage
```

Not merely:

```text
100% coverage
```

---

# 35. Applying that to our `HashGenerator`

Our current suite gives us:

```text
Statements   100%
Branches     100%
Functions    100%
Lines        100%
```

That's good.

But we can still improve our **behavioral test coverage** by adding:

```ts
it("should generate the same hash for the same input and salt", () => {
  const hashGenerator =
    HashGenerator.createHashGenerator(testSalt);

  const hash1 = hashGenerator.generateHash(randInput);
  const hash2 = hashGenerator.generateHash(randInput);

  expect(hash1).toBe(hash2);
});
```

Notice what happens:

```text
                 Code coverage
                       │
                       │
                    100%
                       │
                       ▼
              Already excellent
                       │
                       ▼
        But behavioral requirements
        can still have gaps
                       │
                       ▼
      Add deterministic-hash test
```

That is exactly how we should think about coverage.

---

# 36. The most important takeaway

If we remember only one thing:

> **Test coverage answers "What percentage of our code was executed by our tests?" It does not answer "How well is our code tested?"**

So:

```text
100% coverage
        ≠
100% correctness
```

And:

```text
100% coverage
        ≠
zero bugs
```

Instead:

```text
Coverage
   ↓
Find testing gaps
   ↓
Inspect those gaps
   ↓
Write meaningful tests
   ↓
Verify behavior with assertions
```

For our current Jest learning path, this distinction is important because we're moving from **"How do we write a Jest test?"** toward **"How do we design a genuinely useful test suite?"**. Coverage is one of the tools that helps us make that transition.
