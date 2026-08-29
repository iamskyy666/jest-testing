**Stub vs Fake** is worth going deep on because both replace a real dependency, but they do it in fundamentally different ways.

The easiest distinction is:

> **Stub = predetermined answers.**
> **Fake = simplified working implementation.**

Let's build this from the ground up.

---

# 1. Where Stub and Fake fit

Suppose we're testing this:

```ts
class UserService {
  constructor(private repository: UserRepository) {}

  async getUserName(id: string): Promise<string> {
    const user = await this.repository.findById(id);

    return user.name;
  }
}
```

Our **SUT** is:

```text
UserService
```

It depends on:

```text
UserRepository
```

In production:

```text
UserService
      ↓
UserRepository
      ↓
MongoDB
```

For a unit test, we don't want to necessarily use MongoDB.

So we can replace `UserRepository` with a test double.

Two possibilities:

```text
UserService
    ↓
   Stub
```

or:

```text
UserService
    ↓
   Fake
```

Both replace the real dependency.

But they work very differently.

---

# 2. What is a Stub?

A **stub is a test double that provides predetermined responses to calls made by the SUT.**

The key word is:

> **predetermined**

We tell the dependency exactly what to return.

For example:

```ts
const repository = {
  findById: jest.fn(),
};
```

Then:

```ts
repository.findById.mockResolvedValue({
  id: "123",
  name: "Alice",
});
```

Now whenever our SUT calls:

```ts
await repository.findById("123");
```

the stub responds with:

```ts
{
  id: "123",
  name: "Alice"
}
```

No database.

No query.

No Mongoose.

No network.

---

# 3. Visualizing a Stub

Production:

```text
UserService
     │
     │ findById("123")
     ↓
Repository
     │
     ↓
MongoDB
     │
     ↓
Alice
```

Testing:

```text
UserService
     │
     │ findById("123")
     ↓
   STUB
     │
     ↓
{ id: "123", name: "Alice" }
```

The stub basically says:

> "Don't worry about how the real repository gets the user. Whenever we ask in this test, here's the answer."

---

# 4. Why would we want this?

Suppose we want to test:

```ts
getUserName("123")
```

We don't actually care whether MongoDB can find Alice.

That's the repository's responsibility.

We're testing whether **UserService correctly handles the repository result**.

So we control the repository:

```ts
repository.findById.mockResolvedValue({
  id: "123",
  name: "Alice",
});
```

Then:

```ts
const result = await service.getUserName("123");

expect(result).toBe("Alice");
```

Our test is now focused:

```text
Repository
     ↓
 predetermined result
     ↓
UserService
     ↓
 business logic
     ↓
 assertion
```

---

# 5. A Stub Doesn't Need to Contain Real Logic

This is an important characteristic.

Our stub might literally be:

```ts
const repository = {
  findById: jest.fn()
    .mockResolvedValue({
      id: "123",
      name: "Alice",
    }),
};
```

There is no database lookup.

There is no searching.

There is no algorithm.

It simply returns what we've configured.

That's why we call it a **stub**.

---

# 6. Stub Example: Different Scenarios

This is where stubs become extremely powerful.

Suppose our service needs to handle three situations.

### Scenario 1 — User exists

```ts
repository.findById.mockResolvedValue({
  id: "123",
  name: "Alice",
});
```

We test:

```text
user exists
    ↓
service returns name
```

---

### Scenario 2 — User doesn't exist

```ts
repository.findById.mockResolvedValue(null);
```

We test:

```text
user doesn't exist
    ↓
service handles missing user
```

---

### Scenario 3 — Database failure

```ts
repository.findById.mockRejectedValue(
  new Error("Database unavailable")
);
```

We test:

```text
database fails
    ↓
service handles/rethrows error
```

Notice what we did.

We didn't manipulate MongoDB.

We simply **controlled the dependency's behavior**.

---

# 7. Stub = Control the Input From a Dependency

Think about it this way:

```text
          SUT
           │
           │ asks dependency
           ↓
         STUB
           │
           │ predetermined response
           ↓
          SUT
```

We're essentially controlling one of the SUT's inputs.

The dependency's response becomes a controlled input to the SUT.

---

# 8. Stub Can Return Different Values

Jest gives us several useful APIs.

### `mockReturnValue()`

For synchronous functions:

```ts
const stub = jest.fn();

stub.mockReturnValue(42);
```

Then:

```ts
stub(); // 42
```

---

### `mockResolvedValue()`

For promises:

```ts
const stub = jest.fn();

stub.mockResolvedValue("Alice");
```

Then:

```ts
await stub(); // "Alice"
```

---

### `mockRejectedValue()`

For failed promises:

```ts
const stub = jest.fn();

stub.mockRejectedValue(
  new Error("Something went wrong")
);
```

Then:

```ts
await stub(); // rejects
```

These are extremely common when testing Node.js applications.

---

# 9. What is a Fake?

Now we get to the interesting part.

A **fake is a simplified, working implementation of a real dependency.**

That's the key difference.

A fake isn't simply told:

```text
"Return Alice."
```

Instead, the fake actually implements some behavior.

---

# 10. In-Memory Repository — Classic Fake

Suppose production has:

```ts
class MongoUserRepository {
  async findById(id: string) {
    // MongoDB query
  }

  async create(user: User) {
    // MongoDB insert
  }
}
```

For tests, we could create:

```ts
class InMemoryUserRepository {
  private users: User[] = [];

  async findById(id: string) {
    return this.users.find(user => user.id === id);
  }

  async create(user: User) {
    this.users.push(user);
    return user;
  }
}
```

This is a **fake**.

Why?

Because it actually works.

We can:

```ts
await repository.create(user);
```

and then:

```ts
await repository.findById(user.id);
```

and the fake will actually search its internal array.

---

# 11. Visualizing a Fake

Production:

```text
UserService
     ↓
MongoUserRepository
     ↓
MongoDB
```

Testing:

```text
UserService
     ↓
InMemoryUserRepository
     ↓
JavaScript Array
```

So:

```text
REAL
MongoDB
   ↓
database operations

FAKE
Array
   ↓
simplified database operations
```

The fake substitutes the real infrastructure with a smaller working implementation.

---

# 12. Stub vs Fake — The Core Difference

Let's put them side by side.

### Stub

```ts
const repository = {
  findById: jest.fn()
    .mockResolvedValue({
      id: "1",
      name: "Alice",
    }),
};
```

The behavior is explicitly predetermined.

```text
findById()
    ↓
"Return Alice"
```

### Fake

```ts
class InMemoryUserRepository {
  users = [];

  async findById(id: string) {
    return this.users.find(
      user => user.id === id
    );
  }
}
```

The behavior is actually implemented.

```text
findById("1")
    ↓
search users[]
    ↓
matching user
```

So:

```text
STUB
↓
Configured answer

FAKE
↓
Working simplified behavior
```

---

# 13. A Great Analogy

Imagine we're testing a restaurant ordering system.

Production dependency:

```text
Payment Gateway
```

### Stub

We tell the payment gateway:

```text
"Always say payment succeeded."
```

So:

```text
processPayment()
       ↓
Payment Stub
       ↓
SUCCESS
```

We don't actually process money.

That's a stub.

---

### Fake

We build a tiny fake payment system:

```text
FakePaymentGateway

balance = ₹10,000

charge(₹500)
     ↓
balance = ₹9,500
```

It actually performs simplified payment logic.

That's a fake.

---

# 14. Another Example: Cache

Suppose our production application uses Redis:

```text
Service
   ↓
Redis
```

A stub could be:

```ts
const redis = {
  get: jest.fn()
    .mockResolvedValue("cached-value"),
};
```

We're saying:

> "Whenever `get()` is called, return this."

That's a stub.

A fake cache could be:

```ts
class FakeCache {
  private store = new Map<string, string>();

  get(key: string) {
    return this.store.get(key);
  }

  set(key: string, value: string) {
    this.store.set(key, value);
  }
}
```

Now:

```ts
cache.set("user:1", "Alice");

cache.get("user:1");
```

actually performs cache behavior.

That's a fake.

---

# 15. Why Use a Fake Instead of a Stub?

Fakes become useful when our tests need to exercise **multiple operations that interact with each other**.

Suppose our service does:

```ts
await repository.create(user);

const savedUser =
  await repository.findById(user.id);
```

With a stub, we'd have to configure:

```ts
repository.create.mockResolvedValue(user);

repository.findById.mockResolvedValue(user);
```

We're manually specifying the answer to every call.

With a fake:

```ts
const repository =
  new InMemoryUserRepository();

await repository.create(user);

const savedUser =
  await repository.findById(user.id);
```

The fake naturally produces the result because it actually stores the user.

That's a major difference.

---

# 16. Fakes Are Useful for State

This is particularly relevant to our Calculator learning.

Our Calculator itself is stateful:

```ts
class Calculator {
  value = 0;

  add(num: number) {
    this.value += num;
    return this.value;
  }
}
```

Imagine we wanted to replace some external stateful dependency.

A fake could maintain its own state:

```ts
class FakeCounter {
  private value = 0;

  increment() {
    this.value++;
  }

  getValue() {
    return this.value;
  }
}
```

This is not just:

```ts
jest.fn().mockReturnValue(...)
```

It actually implements state transitions.

---

# 17. Fake Can Be More Realistic

A fake might implement:

```text
create
find
update
delete
```

using:

```text
Array
Map
Set
plain objects
```

instead of:

```text
MongoDB
PostgreSQL
Redis
AWS
external API
```

So the architecture becomes:

```text
                 Repository Interface
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
       MongoRepository        InMemoryFake
              │                     │
              ↓                     ↓
           MongoDB              memory
```

Both implement the same conceptual contract.

---

# 18. This Leads to Dependency Injection

This is where things become really useful for our Node.js learning.

Suppose:

```ts
interface UserRepository {
  findById(id: string): Promise<User | null>;
}
```

Our service:

```ts
class UserService {
  constructor(
    private repository: UserRepository
  ) {}

  async getUser(id: string) {
    return this.repository.findById(id);
  }
}
```

Production:

```ts
const repository =
  new MongoUserRepository();

const service =
  new UserService(repository);
```

Testing:

```ts
const repository =
  new InMemoryUserRepository();

const service =
  new UserService(repository);
```

That's powerful because our SUT doesn't care which implementation it receives.

---

# 19. Stub vs Fake in Dependency Injection

We could also inject a stub:

```ts
const repository: UserRepository = {
  findById: jest.fn()
    .mockResolvedValue(user),
};
```

So we have:

```text
PRODUCTION

UserService
    ↓
MongoUserRepository
    ↓
MongoDB
```

versus:

```text
UNIT TEST

UserService
    ↓
Stub Repository
    ↓
predetermined result
```

or:

```text
INTEGRATION-STYLE TEST

UserService
    ↓
Fake Repository
    ↓
in-memory storage
```

The choice depends on what we're trying to test.

---

# 20. Stub Is Usually Smaller

A stub can be tiny:

```ts
const repository = {
  findById: jest.fn()
    .mockResolvedValue(user),
};
```

A fake might be an entire class:

```ts
class InMemoryUserRepository {
  private users: User[] = [];

  async create(user: User) {
    this.users.push(user);
  }

  async findById(id: string) {
    return this.users.find(
      user => user.id === id
    );
  }

  async delete(id: string) {
    this.users =
      this.users.filter(
        user => user.id !== id
      );
  }
}
```

So:

```text
Stub → usually very small

Fake → potentially substantial implementation
```

---

# 21. But Don't Make Fakes Too Complex

There's an important danger.

Suppose our production repository has:

```text
MongoDB
```

and we build a giant fake MongoDB implementation with:

```text
5000 lines
complex queries
indexes
transactions
aggregation
concurrency
etc.
```

We've created another system that needs testing.

That's counterproductive.

A fake should usually be:

> **as simple as possible while providing the behavior needed by our tests.**

---

# 22. The "Fake Database" Pattern

This is extremely common.

Instead of:

```text
Tests
 ↓
Real PostgreSQL
```

we might have:

```text
Tests
 ↓
In-memory repository
 ↓
Array / Map
```

For example:

```ts
class FakeUserRepository {
  private users = new Map<string, User>();

  async save(user: User) {
    this.users.set(user.id, user);
  }

  async findById(id: string) {
    return this.users.get(id) ?? null;
  }
}
```

Now tests can run without PostgreSQL.

This gives us:

```text
Fast
Deterministic
Isolated
No infrastructure required
```

---

# 23. Stub Can Simulate Failure More Easily

One advantage of a stub is that we can precisely control failures.

```ts
repository.findById.mockRejectedValue(
  new Error("Database unavailable")
);
```

Then our test can verify error handling.

A fake could simulate this too, but we'd have to implement failure behavior:

```ts
class FakeRepository {
  shouldFail = false;

  async findById(id: string) {
    if (this.shouldFail) {
      throw new Error("Database unavailable");
    }

    // ...
  }
}
```

For one particular error scenario, the stub can be simpler.

---

# 24. Stub = Scenario Control

This is perhaps the best way to remember it.

We can tell a stub:

```text
For this test:
    return Alice
```

Another test:

```text
For this test:
    return null
```

Another:

```text
For this test:
    throw an error
```

So stubs are excellent for:

```text
Scenario A
Scenario B
Scenario C
```

---

# 25. Fake = Behavior Simulation

A fake is more appropriate when we want:

```text
Create
   ↓
Store
   ↓
Find
   ↓
Update
   ↓
Delete
```

to actually interact.

We're simulating the dependency's **behavior**, not merely prescribing each response.

---

# 26. A Direct Comparison

|                                          | Stub                  | Fake                 |
| ---------------------------------------- | --------------------- | -------------------- |
| Replaces real dependency                 | ✅                     | ✅                    |
| Has predetermined responses              | ✅                     | Usually not          |
| Has working logic                        | Minimal               | ✅                    |
| Maintains state                          | Usually no            | Often                |
| Usually created with `jest.fn()`         | ✅                     | Not necessarily      |
| Good for specific scenarios              | ⭐⭐⭐                   | ⭐⭐                   |
| Good for multiple interacting operations | ⭐                     | ⭐⭐⭐                  |
| Good for simulating errors               | ⭐⭐⭐                   | ⭐⭐                   |
| Example                                  | `mockResolvedValue()` | In-memory repository |

---

# 27. Let's Connect This Directly to Jest

For stubs, we'll commonly write:

```ts
const dependency = {
  getData: jest.fn(),
};

dependency.getData.mockReturnValue(data);
```

or:

```ts
dependency.getData.mockResolvedValue(data);
```

or:

```ts
dependency.getData.mockRejectedValue(
  new Error("Failed")
);
```

For fakes, we might write a normal TypeScript class:

```ts
class FakeUserRepository {
  private users: User[] = [];

  async create(user: User) {
    this.users.push(user);
    return user;
  }

  async findById(id: string) {
    return this.users.find(
      user => user.id === id
    ) ?? null;
  }
}
```

Notice something important:

> **A fake doesn't need Jest at all.**

That's a very useful distinction.

---

# 28. Stub vs Fake — Jest Dependency

A stub:

```ts
jest.fn()
```

is often specifically created using Jest.

A fake:

```ts
class FakeRepository {}
```

can be completely ordinary TypeScript.

We could use it with:

```text
Jest
Vitest
Mocha
Node test runner
```

or even without a test framework.

---

# 29. A Practical Example

Suppose our SUT is:

```ts
class UserService {
  constructor(
    private repository: UserRepository
  ) {}

  async register(user: User) {
    await this.repository.create(user);

    return this.repository.findById(user.id);
  }
}
```

### Using a Stub

```ts
const repository = {
  create: jest.fn(),
  findById: jest.fn(),
};

repository.create.mockResolvedValue(user);

repository.findById.mockResolvedValue(user);

const service = new UserService(repository);

const result = await service.register(user);

expect(result).toEqual(user);
```

We're manually controlling both responses.

---

### Using a Fake

```ts
const repository =
  new InMemoryUserRepository();

const service =
  new UserService(repository);

const result =
  await service.register(user);

expect(result).toEqual(user);
```

The fake actually:

```text
create()
 ↓
stores user
 ↓
findById()
 ↓
finds user
 ↓
returns user
```

No explicit `mockResolvedValue()` required.

---

# 30. One Subtle Point: "Fake" Doesn't Mean "Bad"

In everyday English:

```text
fake = fake/incorrect
```

But in testing terminology, that's not the idea.

A fake is:

> **A legitimate test implementation that is simpler than the production implementation.**

For example:

```text
Production:
PostgreSQL

Fake:
Map<string, User>
```

The fake isn't trying to reproduce PostgreSQL.

It's trying to reproduce the **relevant behavior required by the SUT**.

---

# 31. When Should We Prefer a Stub?

A stub is a good choice when:

* We need one or two predetermined responses.
* We want precise control over a scenario.
* We need to simulate errors.
* We don't care about the dependency's internal behavior.
* We want a very small test double.

Example:

```ts
repository.findById.mockResolvedValue(null);
```

Very clean.

---

# 32. When Should We Prefer a Fake?

A fake is useful when:

* Multiple operations interact.
* We need persistent state during a test.
* We want a reusable test implementation.
* A real dependency is expensive or inconvenient.
* An in-memory implementation naturally represents the dependency.

Classic examples:

```text
Real DB → In-memory repository
Real Redis → In-memory cache
Real queue → In-memory queue
Real filesystem → In-memory filesystem
Real API → local fake service
```

---

# 33. The Biggest Mental Distinction

Don't memorize merely:

```text
Stub = jest.fn()
Fake = class
```

That's too simplistic.

Instead remember **what the double is doing**:

### Stub

```text
SUT asks:
"What's the result?"

Stub:
"Here's the result I predetermined."
```

### Fake

```text
SUT asks:
"Perform this operation."

Fake:
"Okay, I'll actually perform a simplified version."
```

That's the deeper distinction.

---

# 34. Final Mental Model

Imagine our production application:

```text
                 UserService
                      │
                      ↓
              UserRepository
                      │
                      ↓
                   MongoDB
```

### With a Stub

```text
                 UserService
                      │
                      ↓
               STUB REPOSITORY
                      │
              predetermined
                responses
```

The stub says:

> **"Here's the answer."**

### With a Fake

```text
                 UserService
                      │
                      ↓
              FAKE REPOSITORY
                      │
                      ↓
                 Map / Array
                      │
                      ↓
             actual simplified logic
```

The fake says:

> **"I'll perform a simplified version of the operation."**

So the one line I'd keep in our notes is:

```text
STUB → controls what the dependency returns.

FAKE → provides a simplified working version of the dependency.
```

And this distinction will become **very practical** when we start testing real Node/Express code: repositories, database calls, external APIs, email services, file systems, authentication services, and so on.
