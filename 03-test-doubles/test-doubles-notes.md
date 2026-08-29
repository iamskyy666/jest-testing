**Test doubles** are one of the most important concepts we'll encounter after understanding basic Jest syntax, because they let us test code **without relying on real external dependencies**.

The key idea is simple:

> A **test double** is an object/function/component we use in a test **instead of a real dependency**, usually to isolate the SUT and control its behavior.

---

# 1. First: Why do we need test doubles?

Let's start with the kind of code we've been testing:

```ts
export class Calculator {
  value = 0;

  add(num: number) {
    this.value += num;
    return this.value;
  }
}
```

This is easy to unit test because `Calculator` has no external dependencies.

```text
Test
 ↓
Calculator
 ↓
result
```

But real Node.js applications aren't usually this isolated.

Imagine:

```ts
class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUser(id: string) {
    return this.userRepository.findById(id);
  }
}
```

Now our SUT is:

```text
UserService
```

but it depends on:

```text
UserRepository
```

And perhaps `UserRepository` depends on:

```text
MongoDB
```

So if we test:

```ts
await userService.getUser("123");
```

we might accidentally involve:

```text
UserService
     ↓
UserRepository
     ↓
Mongoose
     ↓
MongoDB
     ↓
Network
     ↓
Actual database
```

That's no longer a nice isolated unit test.

This is where **test doubles** enter.

---

# 2. The basic idea

Instead of giving `UserService` the real repository:

```ts
const repository = new UserRepository();
const service = new UserService(repository);
```

we give it a fake version:

```ts
const fakeRepository = {
  findById: jest.fn(),
};

const service = new UserService(fakeRepository);
```

Now:

```text
                 Test
                  │
                  ↓
             UserService
                  │
                  ↓
           Fake Repository
                  │
                  ↓
             jest.fn()
```

No MongoDB.

No network.

No real repository.

We're testing **UserService's behavior**, not MongoDB.

---

# 3. SUT vs Dependency

This distinction is extremely important.

### SUT

**System Under Test**

The thing we're testing.

```text
UserService
```

### Dependency

Something the SUT needs in order to perform its job.

```text
UserRepository
```

So:

```text
             SUT
              │
              ↓
         UserService
              │
              │ depends on
              ↓
         Dependency
              │
              ↓
       UserRepository
```

A test double replaces the dependency:

```text
             SUT
              │
              ↓
         UserService
              │
              │
              ↓
        Test Double
              │
              ↓
       Fake Repository
```

This lets us isolate the SUT.

---

# 4. What does "double" mean?

Think of an actor's **stand-in/double**.

If a movie requires an actor to jump from a building, a stunt double can stand in for the actor.

The audience still sees something that behaves appropriately for the scene.

Similarly:

```text
Real dependency
      ↓
Test double
```

The test double stands in for the real dependency.

We're saying:

> "For this test, we don't need the real thing. We need something that behaves in a controlled way."

---

# 5. The Five Classic Types of Test Doubles

Traditionally, we talk about five major categories:

```text
Test Doubles
│
├── Dummy
├── Stub
├── Spy
├── Mock
└── Fake
```

These aren't merely five different Jest functions.

They're **different testing roles**.

This distinction is important.

---

# 6. Dummy

A **dummy** is a test double that exists simply because the SUT requires an argument, but the test doesn't actually use it.

For example:

```ts
function createUser(
  name: string,
  logger: Logger
) {
  return {
    name,
  };
}
```

Suppose our test doesn't care about logging.

We still need to supply a logger:

```ts
const dummyLogger = {} as Logger;
```

Then:

```ts
const user = createUser("Skyy", dummyLogger);
```

The dummy exists only to satisfy the dependency requirement.

Conceptually:

```text
SUT requires Logger
       ↓
Test doesn't care about Logger
       ↓
Provide Dummy
       ↓
Continue testing
```

### Dummy's purpose

> **Fill a required parameter.**

It generally doesn't have meaningful behavior.

---

# 7. Stub

A **stub** provides predetermined behavior.

This is one of the most useful test doubles.

Suppose:

```ts
class UserService {
  constructor(private repository: UserRepository) {}

  async getUsername(id: string) {
    const user = await this.repository.findById(id);

    return user.name;
  }
}
```

Our test doesn't want a real database.

We can stub:

```ts
const repository = {
  findById: jest.fn(),
};
```

Then tell the stub what to return:

```ts
repository.findById.mockResolvedValue({
  id: "123",
  name: "Alice",
});
```

Now:

```ts
const result = await service.getUsername("123");

expect(result).toBe("Alice");
```

The important part is:

```ts
mockResolvedValue(...)
```

We're controlling the dependency's output.

---

# 8. Think of a stub as:

> **"When the SUT asks you something, give it this predetermined answer."**

For example:

```text
SUT
 │
 │ findById("123")
 ↓
Stub
 │
 │ "Here's Alice"
 ↓
SUT
```

The stub doesn't care whether the real database contains Alice.

We're controlling the scenario.

---

# 9. Why are stubs powerful?

Suppose we want to test what happens when a user doesn't exist.

Real database:

```text
findById("123")
        ↓
???
```

We don't want to manipulate a real database just to produce that situation.

We can say:

```ts
repository.findById.mockResolvedValue(null);
```

Now:

```text
findById()
   ↓
null
   ↓
SUT handles "user doesn't exist"
```

We can test edge cases very easily.

---

# 10. Spy

A **spy** allows us to observe how a function was called.

This is different from a stub.

A stub primarily answers:

> "What should this dependency return?"

A spy primarily answers:

> "How did the SUT interact with this dependency?"

For example:

```ts
const logger = {
  log: jest.fn(),
};
```

Then:

```ts
service.createUser("Alice");
```

We can check:

```ts
expect(logger.log).toHaveBeenCalled();
```

Or:

```ts
expect(logger.log).toHaveBeenCalledWith("User created");
```

We're observing the interaction.

---

# 11. Spy = observe

Imagine:

```text
SUT
 │
 │ logger.log("User created")
 ↓
Spy
 │
 └── records:
       called? YES
       arguments? ["User created"]
       times? 1
```

The spy lets us inspect that interaction afterward.

---

# 12. Jest's `jest.spyOn()`

Jest gives us a specific API:

```ts
jest.spyOn(object, "method");
```

For example:

```ts
const calculator = new Calculator();

const spy = jest.spyOn(calculator, "add");

calculator.add(5);

expect(spy).toHaveBeenCalledWith(5);
```

Now we're observing the existing method.

This is different from:

```ts
jest.fn()
```

We'll get into that distinction shortly.

---

# 13. Mock

This is where terminology becomes confusing.

In everyday Jest conversations, people often call almost every `jest.fn()` a **mock**.

Technically, though, a **mock** is a test double configured with expectations about how it should be interacted with.

For example:

```ts
const emailService = {
  send: jest.fn(),
};
```

We can expect:

```ts
expect(emailService.send)
  .toHaveBeenCalledWith(
    "alice@example.com",
    "Welcome!"
  );
```

We're saying:

> "The SUT should call this dependency in this particular way."

So mocks are especially useful for **interaction testing**.

---

# 14. Stub vs Mock

This distinction is worth memorizing.

### Stub

Controls the output:

```ts
repository.findById.mockResolvedValue(user);
```

We're saying:

> "Return this."

### Mock

Verifies interaction:

```ts
expect(repository.findById)
  .toHaveBeenCalledWith("123");
```

We're saying:

> "You were supposed to call this."

So:

```text
STUB
 ↓
Control behavior/output

MOCK
 ↓
Verify interaction
```

In Jest, the same `jest.fn()` can effectively serve both roles depending on how we're using it.

---

# 15. Fake

A **fake** is a simplified but working implementation of a dependency.

This is different from a stub.

Suppose our real repository is:

```ts
class MongoUserRepository {
  async findById(id: string) {
    // MongoDB query
  }
}
```

For tests, we could create:

```ts
class InMemoryUserRepository {
  private users = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ];

  async findById(id: string) {
    return this.users.find(user => user.id === id);
  }
}
```

This is a **fake**.

It actually implements repository behavior, but without MongoDB.

---

# 16. Fake vs Stub

This is an important distinction.

### Stub

```ts
const repository = {
  findById: jest.fn()
    .mockResolvedValue(user),
};
```

We're essentially saying:

```text
"When called → return this."
```

### Fake

```ts
class InMemoryUserRepository {
  private users = [];

  async findById(id: string) {
    return this.users.find(...);
  }
}
```

It actually has logic.

```text
                    Fake Repository
                          │
              ┌───────────┴───────────┐
              ↓                       ↓
          findById()              create()
              ↓                       ↓
        searches memory         stores memory
```

So:

> **A fake has a working simplified implementation.**

---

# 17. A Real-World Node.js Example

Imagine our application has:

```text
Controller
    ↓
UserService
    ↓
UserRepository
    ↓
MongoDB
```

When we're testing `UserService`, we don't necessarily want:

```text
UserService
    ↓
UserRepository
    ↓
MongoDB
```

Instead:

```text
UserService
    ↓
Test Double
```

Depending on the test, that double could be:

```text
Dummy
Stub
Spy
Mock
Fake
```

---

# 18. Why Not Always Use the Real Dependency?

Because then our "unit test" can become:

```text
Unit Test
   ↓
Service
   ↓
Repository
   ↓
Mongoose
   ↓
MongoDB
   ↓
Network
```

Now the test can fail because:

```text
MongoDB is down
Network failed
Database changed
Credentials missing
Environment variable missing
Database is slow
```

Our service itself might be completely correct.

That's undesirable for a unit test.

---

# 19. Test doubles give us isolation

Without double:

```text
           Test
             ↓
         UserService
             ↓
       UserRepository
             ↓
          MongoDB
```

With double:

```text
           Test
             ↓
         UserService
             ↓
       Test Double
```

That's the essence of **unit testing**.

We're testing one unit in isolation.

---

# 20. Test doubles also give us control

Suppose our service needs to handle:

### Successful database response

```ts
repository.findById
  .mockResolvedValue(user);
```

### User doesn't exist

```ts
repository.findById
  .mockResolvedValue(null);
```

### Database failure

```ts
repository.findById
  .mockRejectedValue(new Error("DB failed"));
```

Now we can test three scenarios without touching MongoDB:

```text
              findById()
                  │
       ┌──────────┼──────────┐
       ↓          ↓          ↓
      User       null       Error
       ↓          ↓          ↓
    success    not found   failure
```

This is one of the biggest benefits of test doubles.

---

# 21. `jest.fn()` is going to become very important

In Jest, we'll frequently create test doubles using:

```ts
jest.fn()
```

For example:

```ts
const mockFn = jest.fn();
```

Now:

```ts
mockFn();
```

Jest records that call.

We can inspect:

```ts
expect(mockFn).toHaveBeenCalled();
```

We can control its return value:

```ts
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

---

# 22. `jest.fn()` can act as multiple types of doubles

This is subtle but extremely important.

The API:

```ts
jest.fn()
```

doesn't inherently mean:

> "This is a mock."

Its role depends on how we use it.

### As a stub

```ts
const getUser = jest.fn()
  .mockReturnValue(user);
```

We're controlling output.

### As a spy/mock

```ts
expect(getUser).toHaveBeenCalledWith("123");
```

We're checking interaction.

So:

```text
jest.fn()
    │
    ├── Used for controlled output → Stub-like role
    │
    └── Used for interaction checks → Mock/spy-like role
```

This is why Jest terminology can sometimes seem confusing.

---

# 23. Test doubles are about behavior, not merely fake objects

A common misconception is:

> "A test double is just a fake object."

Not necessarily.

It can be:

```text
function
object
class
module
HTTP client
database
timer
logger
API client
repository
```

Anything we substitute for a real dependency can play the role of a test double.

---

# 24. Another Example: Email Service

Suppose:

```ts
class UserService {
  constructor(
    private emailService: EmailService
  ) {}

  async register(email: string) {
    // create user...

    await this.emailService.sendWelcomeEmail(email);
  }
}
```

We don't want our tests sending actual emails.

So:

```ts
const emailService = {
  sendWelcomeEmail: jest.fn(),
};
```

Then:

```ts
const service = new UserService(emailService);

await service.register("alice@example.com");
```

And:

```ts
expect(emailService.sendWelcomeEmail)
  .toHaveBeenCalledWith("alice@example.com");
```

Our test verifies:

```text
register()
   ↓
sendWelcomeEmail()
   ↓
called with correct email
```

No email is actually sent.

That's exactly what we want.

---

# 25. Test doubles also make tests deterministic

Imagine we're testing:

```ts
getCurrentWeather()
```

and it calls a real weather API.

Today's weather could be:

```text
25°C
```

Tomorrow:

```text
27°C
```

Next week:

```text
21°C
```

Our test result could therefore depend on the outside world.

Instead:

```ts
weatherApi.getWeather.mockResolvedValue({
  temperature: 25,
});
```

Now every test run gets:

```text
25°C
```

The test becomes:

```text
repeatable
predictable
deterministic
```

---

# 26. Test doubles aren't only about speed

People often say:

> "Mocks make tests faster."

That's true, but it's not the primary reason.

The bigger reasons are:

### Isolation

We test the SUT separately.

### Control

We decide what dependencies return.

### Determinism

Tests don't depend on external state.

### Failure simulation

We can easily simulate errors.

### Interaction verification

We can verify how dependencies were used.

### Performance

As a bonus, avoiding databases/networks makes tests faster.

---

# 27. The classic five

Here's the cheat sheet we should remember:

| Double    | Main purpose                               |
| --------- | ------------------------------------------ |
| **Dummy** | Fills a required argument                  |
| **Stub**  | Provides controlled/predetermined behavior |
| **Spy**   | Records/observes interactions              |
| **Mock**  | Verifies expected interactions             |
| **Fake**  | Working simplified implementation          |

Or even shorter:

```text
Dummy → "I just need something here."

Stub  → "Return this."

Spy   → "Tell me what happened."

Mock  → "Make sure this interaction happened."

Fake  → "Use this simpler working implementation."
```

---

# 28. How this fits into our Jest learning path

We've now gone:

```text
Testing
   ↓
Unit Testing
   ↓
Jest
   ↓
Test discovery
   ↓
Assertions
   ↓
Hooks
   ↓
Test isolation
   ↓
TEST DOUBLES  ← we are here
```

And test doubles lead directly into the Jest APIs we'll start using heavily:

```text
jest.fn()
   ↓
Mock functions
   ↓
mockReturnValue()
mockResolvedValue()
mockRejectedValue()
   ↓
jest.spyOn()
   ↓
Mock modules
   ↓
jest.mock()
   ↓
Mock implementations
   ↓
Restore / reset / clear
```

Those are the practical Jest mechanisms for creating and managing test doubles.

---

# 29. One final mental model

Suppose our production system is:

```text
                UserService
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Database    Email       Logger
```

For a unit test, we can replace them:

```text
                UserService
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Stub DB    Mock Email   Spy Logger
```

Then our test controls the world around the SUT:

```text
                 TEST
                   │
                   ↓
               UserService
                   │
       ┌───────────┼───────────┐
       ↓           ↓           ↓
    Stub DB    Mock Email   Spy Logger
       │           │           │
    controlled   verify      observe
    response    interaction  interaction
```

That's the fundamental idea:

> **We don't want our unit test to test the entire world. We replace the parts around the SUT with controlled test doubles and focus on the behavior we're actually trying to verify.**

And this is where Jest becomes much more interesting than simply writing `expect(...).toBe(...)`.
