Prevously, `Calculator` test had a hidden problem: **all five tests share the same `Calculator` instance**.

That meant the result of one test affects the next test.

Hooks are one of the mechanisms Jest gives us to control this setup/cleanup.

---

# 1. What are Jest Hooks?

**Jest hooks are functions that let us run setup or cleanup code at specific points in the test lifecycle.**

The four main hooks are:

```ts
beforeAll()
afterAll()
beforeEach()
afterEach()
```

Think of them as:

```text
beforeAll()
    ↓
Runs once before ALL tests

beforeEach()
    ↓
Runs before EACH test

        TEST

afterEach()
    ↓
Runs after EACH test

afterAll()
    ↓
Runs once after ALL tests
```

These hooks are particularly important when our tests deal with **state**.

And our `Calculator` class definitely has state:

```ts
value: number;
```

---

# 2. First, Let's Understand Our Current Problem

Our test currently has:

```ts
describe("Calculator Class Testing", () => {
  const calc = new Calculator();

  it("calc should start with value 0", () => {
    expect(calc.value).toBe(0);
  });

  it("calc add-method should add to the curr. value", () => {
    expect(calc.add(2)).toBe(2);
    expect(calc.add(4)).toBe(6);
    expect(calc.add(-1)).toBe(5);
  });

  it("calc subtract-method should subtract from the curr. value", () => {
    expect(calc.subtract(2)).toBe(3);
    expect(calc.subtract(-1)).toBe(4);
  });

  // ...
});
```

Notice:

```ts
const calc = new Calculator();
```

is outside all the tests.

Therefore, there is **one `Calculator` object shared by every test**.

Let's trace it.

---

# 3. What Actually Happens to `calc`?

Initially:

```text
calc.value = 0
```

### Test 1

```ts
expect(calc.value).toBe(0);
```

State:

```text
0
```

Pass.

---

### Test 2

```ts
calc.add(2)
```

State:

```text
0 → 2
```

Then:

```ts
calc.add(4)
```

State:

```text
2 → 6
```

Then:

```ts
calc.add(-1)
```

State:

```text
6 → 5
```

So after Test 2:

```text
calc.value = 5
```

---

### Test 3

Now we start with:

```text
calc.value = 5
```

not `0`.

Then:

```ts
calc.subtract(2)
```

becomes:

```text
5 → 3
```

Then:

```ts
calc.subtract(-1)
```

becomes:

```text
3 → 4
```

So after Test 3:

```text
calc.value = 4
```

---

### Test 4

It starts with:

```text
calc.value = 4
```

Then:

```ts
calc.isPositive()
```

returns:

```text
true
```

---

### Test 5

Starts with:

```text
calc.value = 4
```

Then:

```ts
calc.subtract(50)
```

becomes:

```text
4 → -46
```

Then:

```ts
calc.isPositive()
```

returns:

```text
false
```

Everything passes.

But there is a problem.

---

# 4. The Tests Are Not Truly Independent

Imagine we reorder the tests.

Suppose the negative test comes first:

```ts
it("isPositive should return false...", () => {
  calc.subtract(50);
  expect(calc.isPositive()).toBeFalsy();
});
```

Initially:

```text
0
```

After:

```text
0 - 50
```

we get:

```text
-50
```

Now the next test:

```ts
it("calc should start with value 0", () => {
  expect(calc.value).toBe(0);
});
```

would fail.

Because:

```text
Expected: 0
Received: -50
```

This reveals the problem:

> **Our tests depend on the order in which they run.**

That's something we generally want to avoid.

---

# 5. This Is Exactly Where `beforeEach()` Helps

We want every test to start with:

```text
Calculator
value = 0
```

So instead of:

```ts
const calc = new Calculator();
```

we can do:

```ts
let calc: Calculator;

beforeEach(() => {
  calc = new Calculator();
});
```

Now Jest does:

```text
beforeEach()
    ↓
new Calculator()
    ↓
Test 1
    ↓
beforeEach()
    ↓
new Calculator()
    ↓
Test 2
    ↓
beforeEach()
    ↓
new Calculator()
    ↓
Test 3
```

Every test receives a **fresh calculator**.

---

# 6. Our Test With `beforeEach()`

Here's the improved version:

```ts
import Calculator from "../Calculator";

describe("Calculator Class Testing", () => {
  let calc: Calculator;

  beforeEach(() => {
    calc = new Calculator();
  });

  it("calc should start with value 0", () => {
    expect(calc.value).toBe(0);
  });

  it("calc add-method should add to the curr. value", () => {
    expect(calc.add(2)).toBe(2);
    expect(calc.add(4)).toBe(6);
    expect(calc.add(-1)).toBe(5);
  });

  it("calc subtract-method should subtract from the curr. value", () => {
    expect(calc.subtract(2)).toBe(-2);
    expect(calc.subtract(-1)).toBe(-1);
  });

  it("calc isPositive-method should return true if curr. value is positive", () => {
    calc.add(10);

    expect(calc.isPositive()).toBeTruthy();
    expect(calc.isPositive()).not.toBeFalsy();
  });

  it("calc isPositive-method should return false if curr. value is negative", () => {
    calc.subtract(50);

    expect(calc.isPositive()).toBeFalsy();
    expect(calc.isPositive()).not.toBeTruthy();
  });
});
```

There is one important correction here.

Your original subtract test expected:

```ts
expect(calc.subtract(2)).toBe(3);
```

because the previous test had left the shared calculator at `5`.

That's actually evidence of the shared-state problem.

With a fresh calculator, we correctly get:

```text
0 - 2 = -2
```

and:

```text
-2 - (-1) = -1
```

So:

```ts
expect(calc.subtract(2)).toBe(-2);
expect(calc.subtract(-1)).toBe(-1);
```

Now each test makes sense **by itself**.

---

# 7. This Is What Good Unit Tests Should Look Like

A good test should ideally be:

```text
Independent
Predictable
Repeatable
Isolated
```

We don't want:

```text
Test B
   ↓
depends on Test A
```

We want:

```text
Test A ─── independent

Test B ─── independent

Test C ─── independent
```

And `beforeEach()` is one of the most common tools for achieving this.

---

# 8. Why `let calc` Instead of `const calc`?

We now write:

```ts
let calc: Calculator;
```

instead of:

```ts
const calc = new Calculator();
```

Why?

Because `beforeEach()` assigns a **new object** before every test:

```ts
beforeEach(() => {
  calc = new Calculator();
});
```

We can't do:

```ts
const calc: Calculator;

beforeEach(() => {
  calc = new Calculator();
});
```

because a `const` variable must be initialized when it's declared.

So:

```ts
let calc: Calculator;
```

means:

> "We'll declare the variable now and assign its value during setup."

---

# 9. `beforeEach()` in Slow Motion

Suppose we have:

```ts
beforeEach(() => {
  calc = new Calculator();
});
```

and:

```ts
it("test A", () => {});
it("test B", () => {});
it("test C", () => {});
```

Jest conceptually does:

```text
Run beforeEach()
      ↓
calc = new Calculator()
      ↓
Run Test A
      ↓
Run beforeEach()
      ↓
calc = new Calculator()
      ↓
Run Test B
      ↓
Run beforeEach()
      ↓
calc = new Calculator()
      ↓
Run Test C
```

So we get:

```text
Test A → Calculator #1

Test B → Calculator #2

Test C → Calculator #3
```

These are separate objects.

---

# 10. What About `afterEach()`?

`afterEach()` does the opposite.

It runs **after every test**.

For example:

```ts
afterEach(() => {
  console.log("Test finished");
});
```

Then:

```text
beforeEach
   ↓
test
   ↓
afterEach

beforeEach
   ↓
test
   ↓
afterEach
```

A common use is cleanup.

For example:

```ts
afterEach(() => {
  jest.clearAllMocks();
});
```

We'll encounter this heavily when we learn mocking.

---

# 11. Let's Add `beforeEach()` and `afterEach()` to Our Calculator

We could temporarily do:

```ts
describe("Calculator Class Testing", () => {
  let calc: Calculator;

  beforeEach(() => {
    console.log("🟢 beforeEach");
    calc = new Calculator();
  });

  afterEach(() => {
    console.log("🔴 afterEach");
  });

  // tests...
});
```

Then run:

```bash
npm test -- calculator
```

Conceptually, we'll see:

```text
🟢 beforeEach
Test 1
🔴 afterEach

🟢 beforeEach
Test 2
🔴 afterEach

🟢 beforeEach
Test 3
🔴 afterEach

🟢 beforeEach
Test 4
🔴 afterEach

🟢 beforeEach
Test 5
🔴 afterEach
```

That's the lifecycle.

---

# 12. `beforeAll()`

Now suppose we have:

```ts
beforeAll(() => {
  console.log("SETUP");
});
```

Unlike `beforeEach()`, this executes **only once**.

For example:

```ts
describe("Calculator Class Testing", () => {
  beforeAll(() => {
    console.log("SETUP");
  });

  it("test 1", () => {});
  it("test 2", () => {});
  it("test 3", () => {});
});
```

Conceptually:

```text
beforeAll()
    ↓
Test 1
    ↓
Test 2
    ↓
Test 3
```

Only one `beforeAll()`.

---

# 13. `afterAll()`

Same idea, but at the end.

```ts
afterAll(() => {
  console.log("CLEANUP");
});
```

Lifecycle:

```text
beforeAll()
    ↓
Test 1
    ↓
Test 2
    ↓
Test 3
    ↓
afterAll()
```

It runs once after all tests in that scope have finished.

---

# 14. The Four Hooks Together

Now we can see the complete lifecycle:

```text
              beforeAll()
                   ↓
        ┌─────────────────────┐
        │                     │
        ↓                     │
   beforeEach()               │
        ↓                     │
      Test 1                  │
        ↓                     │
   afterEach()                │
        ↓                     │
   beforeEach()               │
        ↓                     │
      Test 2                  │
        ↓                     │
   afterEach()                │
        ↓                     │
   beforeEach()               │
        ↓                     │
      Test 3                  │
        ↓                     │
   afterEach()                │
        ↓                     │
        └─────────────────────┘
                   ↓
              afterAll()
```

That's the basic Jest hook lifecycle.

---

# 15. What Should We Use Each Hook For?

A useful rule:

### `beforeAll()`

Use for **one-time setup**.

```ts
beforeAll(() => {
  // expensive setup
});
```

Think:

> "Do this once before the entire group."

---

### `beforeEach()`

Use for **fresh setup before every test**.

```ts
beforeEach(() => {
  calc = new Calculator();
});
```

Think:

> "Give every test a clean starting point."

This is extremely common in unit testing.

---

### `afterEach()`

Use for **cleanup after every test**.

```ts
afterEach(() => {
  jest.clearAllMocks();
});
```

Think:

> "Clean up whatever this test changed."

---

### `afterAll()`

Use for **one-time final cleanup**.

```ts
afterAll(() => {
  // close shared resources
});
```

Think:

> "We're completely done with this test suite."

---

# 16. `beforeEach()` Is Particularly Important for State

Our Calculator is stateful:

```ts
class Calculator {
  value: number;
}
```

Every call modifies:

```ts
this.value
```

For example:

```text
add(5)
 ↓
value: 0 → 5

subtract(2)
 ↓
value: 5 → 3
```

Therefore, sharing the same instance between tests is dangerous.

We want:

```text
Test 1
Calculator A
value = 0

Test 2
Calculator B
value = 0

Test 3
Calculator C
value = 0
```

rather than:

```text
Test 1
      ↓
Calculator
value = 5
      ↓
Test 2
      ↓
value = 3
      ↓
Test 3
      ↓
value = -10
```

---

# 17. This Is Called Test Isolation

**Test isolation** means one test shouldn't depend on the state created by another test.

Bad:

```text
Test A
  ↓
changes state
  ↓
Test B relies on that state
```

Good:

```text
Test A → own state

Test B → own state

Test C → own state
```

Hooks are a major tool for achieving this.

---

# 18. Our "Before" Version

Your original test:

```ts
describe("Calculator Class Testing", () => {
  const calc = new Calculator();

  it("calc should start with value 0", () => {
    expect(calc.value).toBe(0);
  });

  it("calc add-method should add to the curr. value", () => {
    expect(calc.add(2)).toBe(2);
    expect(calc.add(4)).toBe(6);
    expect(calc.add(-1)).toBe(5);
  });

  it("calc subtract-method should subtract from the curr. value", () => {
    expect(calc.subtract(2)).toBe(3);
    expect(calc.subtract(-1)).toBe(4);
  });

  it("calc isPositive-method should return true if curr. value is positive", () => {
    expect(calc.isPositive()).not.toBeFalsy();
    expect(calc.isPositive()).toBeTruthy();
  });

  it("calc isPositive-method should return false if curr. value is negative", () => {
    calc.subtract(50);
    expect(calc.isPositive()).toBeFalsy();
    expect(calc.isPositive()).not.toBeTruthy();
  });
});
```

It passes, but there is hidden coupling:

```text
Test 1
  ↓
value = 0

Test 2
  ↓
value = 5

Test 3
  ↓
value = 4

Test 4
  ↓
value = 4

Test 5
  ↓
value = -46
```

The tests are effectively sharing a single mutable object.

---

# 19. Our "After" Version

A cleaner version:

```ts
import Calculator from "../Calculator";

describe("Calculator Class Testing", () => {
  let calc: Calculator;

  beforeEach(() => {
    calc = new Calculator();
  });

  it("calc should start with value 0", () => {
    expect(calc.value).toBe(0);
  });

  it("calc add-method should add to the curr. value", () => {
    expect(calc.add(2)).toBe(2);
    expect(calc.add(4)).toBe(6);
    expect(calc.add(-1)).toBe(5);
  });

  it("calc subtract-method should subtract from the curr. value", () => {
    expect(calc.subtract(2)).toBe(-2);
    expect(calc.subtract(-1)).toBe(-1);
  });

  it("calc isPositive-method should return true if curr. value is positive", () => {
    calc.add(10);

    expect(calc.isPositive()).toBeTruthy();
    expect(calc.isPositive()).not.toBeFalsy();
  });

  it("calc isPositive-method should return false if curr. value is negative", () => {
    calc.subtract(50);

    expect(calc.isPositive()).toBeFalsy();
    expect(calc.isPositive()).not.toBeTruthy();
  });
});
```

Now:

```text
beforeEach
    ↓
new Calculator()
    ↓
Test
```

happens five times.

---

# 20. Notice How the Tests Became Better

Our positive test previously relied on the previous tests:

```ts
expect(calc.isPositive()).toBeTruthy();
```

because `calc.value` happened to be `4`.

Now we explicitly establish the condition:

```ts
calc.add(10);
```

Then:

```text
0 + 10 = 10
```

Then:

```ts
expect(calc.isPositive()).toBeTruthy();
```

That's much better.

The test itself now communicates its setup.

Likewise:

```ts
calc.subtract(50);
```

explicitly establishes:

```text
0 - 50 = -50
```

Then we test:

```ts
expect(calc.isPositive()).toBeFalsy();
```

---

# 21. This Leads to a Fundamental Testing Principle

A test should ideally follow:

```text
ARRANGE
   ↓
ACT
   ↓
ASSERT
```

For example:

```ts
it("should return false for a negative value", () => {
  // ARRANGE
  calc.subtract(50);

  // ACT
  const result = calc.isPositive();

  // ASSERT
  expect(result).toBe(false);
});
```

Our `beforeEach()` can handle common arrangement:

```ts
beforeEach(() => {
  calc = new Calculator();
});
```

Then each test only needs its specific setup.

This pattern will become extremely important when we test services, controllers, APIs, databases, etc.

---

# 22. Hooks Can Exist Outside `describe()`

We can technically write:

```ts
beforeEach(() => {
  // ...
});

test("...", () => {});
```

at the top level.

That hook applies to tests in that scope.

But when we're organizing related tests, this is often clearer:

```ts
describe("Calculator", () => {
  beforeEach(() => {
    // ...
  });

  test("...", () => {});
});
```

The scope becomes obvious.

---

# 23. Hooks Can Be Nested

This is another powerful concept.

We can have:

```ts
describe("Calculator", () => {
  beforeEach(() => {
    console.log("outer");
  });

  describe("add", () => {
    beforeEach(() => {
      console.log("inner");
    });

    it("works", () => {});
  });
});
```

Jest has a hierarchy.

Conceptually:

```text
Calculator suite
│
├── outer beforeEach
│
└── add suite
     │
     ├── inner beforeEach
     │
     └── test
```

The inner suite inherits relevant outer hooks.

We'll encounter this more as our tests become larger.

---

# 24. Hooks Are Not Just for Databases

Beginners often associate hooks with:

```text
beforeAll → connect DB
afterAll  → disconnect DB
```

That's one use, but hooks are much broader.

We can use them for:

### Object creation

```ts
beforeEach(() => {
  calc = new Calculator();
});
```

### Mock setup

```ts
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Environment setup

```ts
beforeEach(() => {
  process.env.NODE_ENV = "test";
});
```

### Database setup

```ts
beforeAll(async () => {
  await connectDatabase();
});
```

### Database cleanup

```ts
afterEach(async () => {
  await clearDatabase();
});
```

### Resource cleanup

```ts
afterAll(async () => {
  await disconnectDatabase();
});
```

We'll encounter these progressively.

---

# 25. A Small Warning About `beforeAll()`

We shouldn't automatically choose:

```ts
beforeAll()
```

just because it seems more efficient.

Suppose:

```ts
beforeAll(() => {
  calc = new Calculator();
});
```

Now every test shares the same instance again.

We've just recreated the original problem.

For stateful objects, we usually want:

```ts
beforeEach(() => {
  calc = new Calculator();
});
```

not:

```ts
beforeAll(() => {
  calc = new Calculator();
});
```

The question should be:

> **Does this resource/state need to be fresh for every test?**

If yes → `beforeEach()`.

---

# 26. Before vs After

### Before

```text
One Calculator
      │
      ├── Test 1
      ├── Test 2
      ├── Test 3
      ├── Test 4
      └── Test 5

State carries across tests ❌
```

### After

```text
Test 1 → Calculator #1 → discarded

Test 2 → Calculator #2 → discarded

Test 3 → Calculator #3 → discarded

Test 4 → Calculator #4 → discarded

Test 5 → Calculator #5 → discarded
```

That's much closer to proper unit-test isolation.

---

# 27. The Four Hooks — One Sentence Each

Keep this cheat sheet:

```text
beforeAll()
→ Once before the whole suite

beforeEach()
→ Before every test

afterEach()
→ After every test

afterAll()
→ Once after the whole suite
```

Or visually:

```text
                 beforeAll
                     ↓
       ┌─────────────┴─────────────┐
       ↓                           ↓
  beforeEach                  beforeEach
       ↓                           ↓
     Test 1                      Test 2
       ↓                           ↓
  afterEach                   afterEach
       └─────────────┬─────────────┘
                     ↓
                  afterAll
```

---

# 28. One More Important Thing About Your Original Test

The fact that your original tests passed **doesn't mean the test design was ideal**.

This is a crucial testing lesson.

We can have:

```text
PASS ✅
```

and still have:

```text
Poor test isolation ❌
```

A passing test only tells us:

> "Given the current conditions and execution, the assertions passed."

It doesn't automatically tell us:

> "These tests are well designed."

That's why we're learning testing principles rather than simply learning Jest syntax.

---

## The key lesson from our Calculator

Our original:

```ts
const calc = new Calculator();
```

created **shared mutable state**.

Our improved:

```ts
let calc: Calculator;

beforeEach(() => {
  calc = new Calculator();
});
```

creates **fresh state for every test**.

That's the main reason `beforeEach()` is so important in unit testing.

And as we move from this simple Calculator into **async functions, mocks, Express controllers, services, databases, and API testing**, we'll repeatedly see the same pattern:

```text
Setup
  ↓
Run test
  ↓
Cleanup
```

Jest hooks give us a clean, standardized way to manage that lifecycle.

---


```ts
// BEFORE USING JEST-HOOKS 🔵
import Calculator from "../Calculator";

describe("Calculator Class Testing", () => {
  const calc = new Calculator();
  it("calc should start with value 0", () => {
    expect(calc.value).toBe(0);
  });

  it("calc add-method should add to the curr. value", () => {
    expect(calc.add(2)).toBe(2);
    expect(calc.add(4)).toBe(6);
    expect(calc.add(-1)).toBe(5);
  });

  it("calc subtract-method should subtract from the curr. value", () => {
    expect(calc.subtract(2)).toBe(3);
    expect(calc.subtract(-1)).toBe(4);
  });

  it("calc isPositive-method should return true if curr. value is positive", () => {
    expect(calc.isPositive()).not.toBeFalsy();
    expect(calc.isPositive()).toBeTruthy();
  });

  it("calc isPositive-method should return false if curr. value is negative", () => {
    calc.subtract(50); // make the current val. less than 0
    expect(calc.isPositive()).toBeFalsy();
    expect(calc.isPositive()).not.toBeTruthy();
  });
});

// ---------------------------------
/*
$ npm test -- calculator

> 02-jest-tutorial@1.0.0 test
> jest calculator

 PASS  src/__tests__/calculator.spec.ts
  Calculator Class Testing
    √ calc should start with value 0 (3 ms)
    √ calc add-method should add to the curr. value (1 ms)
    √ calc subtract-method should subtract from the curr. value (1 ms)
    √ calc isPositive-method should return true if curr. value is positive (1 ms)
    √ calc isPositive-method should return false if curr. value is negative

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        3.667 s
Ran all test suites matching calculator.
*/
// ---------------------------------

```
```ts
// AFTER USING JEST-HOOKS 🟢
import Calculator from "../Calculator";

describe("Calculator Class Testing", () => {
  let calc: Calculator; // SUT
  beforeEach(() => {
    console.log(`beforeEach() test.. ✅`);
    calc= new Calculator()
  });

  afterAll(() => {
    console.log(`afterAll() tests.. ☑️`);
  });
  // const calc = new Calculator();
  it("calc should start with value 0", () => {
    expect(calc.value).toBe(0);
  });

  it("calc add-method should add to the curr. value", () => {
    expect(calc.add(2)).toBe(2);
    expect(calc.add(4)).toBe(6);
    expect(calc.add(-1)).toBe(5);
  });

  it("calc subtract-method should subtract from the curr. value", () => {
    expect(calc.subtract(2)).toBe(-2);
    expect(calc.subtract(-4)).toBe(2);
  });

  it("calc isPositive-method should return true if curr. value is positive", () => {
    calc.add(10)
    expect(calc.isPositive()).not.toBeFalsy();
    expect(calc.isPositive()).toBeTruthy();
  });

  it("calc isPositive-method should return false if curr. value is negative", () => {
    calc.subtract(50); // make the current val. less than 0
    expect(calc.isPositive()).toBeFalsy();
    expect(calc.isPositive()).not.toBeTruthy();
  });
});

// ---------------------------------
/*
$ npm test -- calculator

> 02-jest-tutorial@1.0.0 test
> jest calculator

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    beforeEach() test.. ✅

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:6:13)

  console.log
    afterAll() tests.. ☑️

      at Object.<anonymous> (src/__tests__/C:/Users/ASUS/Desktop/jest-testing/02-jest-core/src/__tests__/calculator.spec.ts:11:13)

 PASS  src/__tests__/calculator.spec.ts
  Calculator Class Testing
    √ calc should start with value 0 (29 ms)
    √ calc add-method should add to the curr. value (2 ms)
    √ calc subtract-method should subtract from the curr. value (3 ms)
    √ calc isPositive-method should return true if curr. value is positive (3 ms)
    √ calc isPositive-method should return false if curr. value is negative (4 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        2.604 s, estimated 3 s
Ran all test suites matching calculator.
*/
// ---------------------------------

```
