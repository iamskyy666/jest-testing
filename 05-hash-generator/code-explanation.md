We have two pieces:

```text
HashGenerator.ts
       │
       │  implementation
       ▼
HashGenerator.spec.ts
       │
       │  verifies behavior
       ▼
     Jest
```

The key idea is that our test suite is testing a **cryptographic HMAC-based hash generator** with a URL-safe output format.

---

# 1. The complete implementation

Our class is:

```ts
import { createHmac } from 'crypto';

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
        createHmac('sha256', this.hashSalt).update(input).digest('base64')
      ).toString()
    );
  }

  private makeUrlSafe(str: string): string {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}
```

Let's understand this from the outside inward.

---

# 2. What is `HashGenerator`?

```ts
export class HashGenerator {
```

We have a class whose responsibility is:

> Given a secret/salt and an input, generate a deterministic SHA-256 HMAC and return it in a URL-safe format.

Conceptually:

```text
              HashGenerator
                    │
        ┌───────────┴───────────┐
        │                       │
     hashSalt              generateHash()
        │                       │
      secret                  input
                                │
                                ▼
                         HMAC-SHA256
                                │
                                ▼
                          Base64 string
                                │
                                ▼
                         URL-safe string
```

---

# 3. `hashSalt`

```ts
private hashSalt: string;
```

This is an instance property.

It stores the secret value that will be used during HMAC generation.

For example:

```ts
const hashGenerator =
  HashGenerator.createHashGenerator("testSalt123");
```

Internally, our object has roughly:

```text
HashGenerator object
│
└── hashSalt = "testSalt123"
```

Because it's:

```ts
private
```

code outside the class cannot directly access it:

```ts
hashGenerator.hashSalt // ❌
```

The class itself can use it:

```ts
this.hashSalt
```

---

# 4. Why is the constructor private?

```ts
private constructor(hashSalt: string) {
  this.hashSalt = hashSalt;
}
```

This is an important TypeScript design decision.

Normally we'd write:

```ts
const generator = new HashGenerator("secret");
```

But because the constructor is:

```ts
private
```

we cannot instantiate the class from outside:

```ts
new HashGenerator("secret"); // ❌
```

Instead, the class forces us to use:

```ts
HashGenerator.createHashGenerator("secret");
```

Why?

Because the author wants object creation to go through a **controlled factory method**.

---

# 5. The static factory method

```ts
static createHashGenerator(hashSalt: string): HashGenerator {
  return new HashGenerator(hashSalt);
}
```

This is a **static method**.

That means we call it on the class itself:

```ts
HashGenerator.createHashGenerator(...)
```

rather than on an instance:

```ts
generator.createHashGenerator(...) // ❌
```

The method receives:

```ts
hashSalt: string
```

and returns:

```ts
HashGenerator
```

So TypeScript tells us:

```text
createHashGenerator(string)
             ↓
       HashGenerator
```

Internally:

```ts
return new HashGenerator(hashSalt);
```

So the factory is essentially a controlled gateway to the private constructor.

---

# 6. Why our first test makes sense now

Our test was:

```ts
it("should create a new instance with hash-salt", () => {
  const hashGenerator = HashGenerator.createHashGenerator(testSalt);

  expect(hashGenerator).toBeDefined();
  expect(hashGenerator).toBeInstanceOf(HashGenerator);
});
```

Now we know exactly what we're testing.

The factory:

```ts
HashGenerator.createHashGenerator(testSalt)
```

should:

1. return something
2. return a `HashGenerator`
3. internally initialize its salt

We can't directly inspect:

```ts
hashSalt
```

because it's private.

So we test the observable result:

```ts
toBeInstanceOf(HashGenerator)
```

---

# 7. Why the second test makes sense

```ts
const hashGenerator1 =
  HashGenerator.createHashGenerator(testSalt);

const hashGenerator2 =
  HashGenerator.createHashGenerator(testSalt);

expect(hashGenerator1).not.toBe(hashGenerator2);
```

Look at the factory:

```ts
return new HashGenerator(hashSalt);
```

Every invocation executes `new HashGenerator(...)`.

Therefore:

```text
factory call #1
       ↓
new HashGenerator(...)
       ↓
Object A


factory call #2
       ↓
new HashGenerator(...)
       ↓
Object B
```

Even though both contain the same salt, they're different objects.

Therefore:

```ts
hashGenerator1 !== hashGenerator2
```

and:

```ts
.not.toBe()
```

is exactly the correct matcher.

---

# 8. Now the interesting part — `generateHash()`

```ts
public generateHash(input: string): string {
```

This is our public API.

Outside code can call:

```ts
hashGenerator.generateHash("hello");
```

The method accepts:

```ts
input: string
```

and promises to return:

```ts
string
```

So:

```text
string input
     │
     ▼
generateHash()
     │
     ▼
string output
```

The internal implementation has several stages.

---

# 9. Stage 1 — `createHmac('sha256', this.hashSalt)`

```ts
createHmac('sha256', this.hashSalt)
```

This comes from Node's built-in:

```ts
import { createHmac } from 'crypto';
```

HMAC means:

> **Hash-based Message Authentication Code**

It combines:

```text
secret key
    +
message/input
    +
hash algorithm
```

to produce a cryptographic digest.

Here:

```ts
'sha256'
```

is our hashing algorithm.

And:

```ts
this.hashSalt
```

is our secret key.

So conceptually:

```text
HMAC-SHA256(
    key = hashSalt,
    message = input
)
```

---

# 10. Important: this is technically a key, not really a salt

Our variable is named:

```ts
hashSalt
```

But cryptographically, we're passing it here:

```ts
createHmac('sha256', this.hashSalt)
```

as the **HMAC key**.

That's worth remembering.

A traditional password-hashing salt has a somewhat different role: it's usually a unique, non-secret value added to prevent identical passwords from producing identical hashes.

An HMAC key is normally **secret**.

So:

```text
hashSalt
```

is the application's naming choice, but in this implementation it's functioning as an **HMAC secret/key**.

That's also why your test calls the second value:

```ts
differentSalt
```

and describes it as a "secret".

---

# 11. Stage 2 — `.update(input)`

```ts
createHmac('sha256', this.hashSalt)
  .update(input)
```

`createHmac()` gives us an HMAC object.

Then:

```ts
.update(input)
```

feeds our input into it.

For example:

```ts
input = "randomInput123"
```

Conceptually:

```text
HMAC-SHA256
     │
     ├── key: testSalt123
     │
     └── input: randomInput123
              │
              ▼
          cryptographic
            calculation
```

This explains our test:

```ts
expect(hash1).not.toBe(hash2);
```

when inputs differ.

If:

```text
key = same
input = different
```

the resulting HMAC should be different.

---

# 12. Stage 3 — `.digest('base64')`

```ts
.digest('base64')
```

This is where we finalize the HMAC calculation and request the result encoded as Base64.

So:

```ts
createHmac(...)
  .update(input)
  .digest('base64')
```

produces something conceptually like:

```text
q83v4J+9.../abc...==
```

The exact value depends on the key and input.

The important thing is that standard Base64 can contain:

```text
+
/
=
```

And that's precisely why we have the next stage.

---

# 13. Why Base64?

Cryptographic hashes are fundamentally binary data.

A SHA-256 digest is:

```text
256 bits
```

We don't normally want to pass raw binary bytes around.

So we encode those bytes into text.

Base64 is one such encoding.

For SHA-256:

```text
256 bits
   ↓
32 bytes
   ↓
Base64 representation
```

The resulting Base64 string can contain:

```text
A-Z
a-z
0-9
+
/
=
```

The last three characters are the interesting ones for our implementation.

---

# 14. Stage 4 — `Buffer.from(...)`

Now we reach:

```ts
Buffer.from(
  createHmac('sha256', this.hashSalt)
    .update(input)
    .digest('base64')
)
```

This deserves attention.

`digest('base64')` has already produced a string.

So we're effectively doing:

```ts
Buffer.from(base64String)
```

Since no encoding is specified in `Buffer.from()`, Node interprets the string using UTF-8.

So we're taking the Base64 text and putting that text into a Buffer.

For example:

```text
Base64 string
     │
     ▼
"abc+123/=="
     │
     ▼
Buffer containing those characters
```

---

# 15. Stage 5 — `.toString()`

Then:

```ts
.toString()
```

converts that Buffer back into a string.

So the whole thing:

```ts
Buffer.from(
  createHmac(...)
    .update(input)
    .digest('base64')
).toString()
```

is effectively:

```text
HMAC
 ↓
Base64 string
 ↓
Buffer
 ↓
String again
```

And that may look unnecessarily complicated.

That's because **it is somewhat redundant** in this implementation.

We could likely write:

```ts
public generateHash(input: string): string {
  return this.makeUrlSafe(
    createHmac("sha256", this.hashSalt)
      .update(input)
      .digest("base64")
  );
}
```

The `Buffer.from(...).toString()` doesn't provide meaningful additional transformation here because `digest("base64")` already gives us a string.

That is an important observation when reading code critically.

---

# 16. Stage 6 — `makeUrlSafe()`

Finally:

```ts
return this.makeUrlSafe(...)
```

We send the Base64 string to:

```ts
private makeUrlSafe(str: string): string
```

This method transforms standard Base64 into a URL-safe representation.

---

# 17. Understanding `makeUrlSafe()`

```ts
private makeUrlSafe(str: string): string {
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

There are three transformations.

---

## Transformation 1

```ts
.replace(/\+/g, '-')
```

We're replacing:

```text
+
```

with:

```text
-
```

The regex:

```regex
/\+/g
```

means:

> Find every `+` character.

The `g` means **global** — don't stop after the first occurrence.

Example:

```text
abc+123+xyz
```

becomes:

```text
abc-123-xyz
```

---

# 18. Why is `+` escaped?

Notice:

```regex
\+
```

rather than:

```regex
+
```

In regular expressions, `+` normally has special meaning.

For example:

```regex
a+
```

means:

> Match one or more `a` characters.

So if we want to match the literal `+` character, we escape it:

```regex
\+
```

Therefore:

```ts
/\+/g
```

means:

> Find literal plus signs globally.

---

# 19. Transformation 2

```ts
.replace(/\//g, '_')
```

This replaces every:

```text
/
```

with:

```text
_
```

For example:

```text
abc/123/xyz
```

becomes:

```text
abc_123_xyz
```

The `/` itself has special significance in JavaScript regex syntax because regex literals are surrounded by `/`.

That's why we escape it:

```regex
\/
```

---

# 20. Transformation 3

```ts
.replace(/=/g, '')
```

This removes every:

```text
=
```

because we're replacing it with:

```text
""
```

which is an empty string.

For example:

```text
abc123==
```

becomes:

```text
abc123
```

---

# 21. The complete transformation

Suppose Base64 gives us:

```text
abc+123/xyz==
```

Then:

### First

```ts
.replace(/\+/g, '-')
```

gives:

```text
abc-123/xyz==
```

### Second

```ts
.replace(/\//g, '_')
```

gives:

```text
abc-123_xyz==
```

### Third

```ts
.replace(/=/g, '')
```

gives:

```text
abc-123_xyz
```

So:

```text
Standard Base64
      │
      ▼
abc+123/xyz==
      │
      ├── + → -
      ├── / → _
      └── = → removed
      │
      ▼
abc-123_xyz
```

This is the core reason for our third test.

---

# 22. Now our URL-safe test makes perfect sense

Our test:

```ts
expect(hash).not.toMatch(/[+/=]/);
```

is directly testing the three transformations:

```text
makeUrlSafe()
    │
    ├── + → -
    ├── / → _
    └── = → ""
```

Therefore the final output should contain none of:

```text
+
/
=
```

That's a very nicely targeted test.

---

# 23. Why `private makeUrlSafe()`?

```ts
private makeUrlSafe(str: string): string
```

This isn't part of the public API.

Consumers of our class don't need to know that URL-safety is implemented through a method called `makeUrlSafe`.

They only need:

```ts
generateHash(input)
```

So our public interface is:

```text
HashGenerator
      │
      └── generateHash()
```

while the internal implementation is:

```text
HashGenerator
      │
      ├── hashSalt
      │
      ├── generateHash()
      │       │
      │       └── makeUrlSafe()
      │
      └── makeUrlSafe()
```

This is **encapsulation**.

We expose the behavior consumers need and hide implementation details.

---

# 24. Now let's connect every test to the implementation

This is the most useful part.

### Test 1

```ts
expect(hashGenerator).toBeDefined();
expect(hashGenerator).toBeInstanceOf(HashGenerator);
```

Tests:

```ts
static createHashGenerator(hashSalt: string): HashGenerator {
  return new HashGenerator(hashSalt);
}
```

We're verifying that the factory actually creates our class.

---

### Test 2

```ts
expect(hashGenerator1).not.toBe(hashGenerator2);
```

Tests:

```ts
return new HashGenerator(hashSalt);
```

Each invocation creates a fresh object.

---

### Test 3

```ts
expect(hash).not.toMatch(/[+/=]/);
```

Tests:

```ts
.replace(/\+/g, '-')
.replace(/\//g, '_')
.replace(/=/g, '');
```

We're verifying the URL-safe conversion.

---

### Test 4

```ts
expect(hash1).not.toBe(hash2);
```

Tests:

```ts
.update(input)
```

Changing the input should change the HMAC.

---

### Test 5

```ts
expect(hash1).not.toBe(hash2);
```

Tests:

```ts
createHmac('sha256', this.hashSalt)
```

Changing the HMAC key should change the resulting hash.

---

### Test 6

```ts
expect(() => hashGenerator.generateHash("")).not.toThrow();
```

Tests that our implementation accepts an empty string and doesn't throw.

Notice that nothing in the implementation explicitly rejects:

```ts
""
```

so this test confirms that behavior.

---

# 25. One important missing test: determinism

Earlier I pointed out that the test name:

```ts
"should generate consistent hashes for different inputs"
```

is misleading.

Now that we see the implementation, we can see an even more important test to add.

HMAC is deterministic.

If:

```text
same algorithm
+
same key
+
same input
```

are supplied, we should get:

```text
same hash
```

So we should test:

```ts
it("should generate the same hash for the same input and salt", () => {
  const hashGenerator =
    HashGenerator.createHashGenerator(testSalt);

  const hash1 = hashGenerator.generateHash(randInput);
  const hash2 = hashGenerator.generateHash(randInput);

  expect(hash1).toBe(hash2);
});
```

This is different from your existing test.

Your existing test says:

```text
different input → different hash
```

The new test says:

```text
same input → same hash
```

Together they establish an important part of the hashing contract:

```text
                 HashGenerator
                       │
          ┌────────────┴────────────┐
          │                         │
    same input/key           different input/key
          │                         │
          ▼                         ▼
     same hash                 different hash
```

---

# 26. Another subtle point: this isn't password hashing

Because we're using:

```ts
createHmac("sha256", this.hashSalt)
```

we should be precise about what this class is doing.

This is **HMAC-SHA256**, not a password-hashing algorithm like:

```text
bcrypt
scrypt
Argon2
PBKDF2
```

For passwords, we generally want deliberately expensive password hashing algorithms.

HMAC-SHA256 is appropriate for things such as:

```text
signed tokens
message authentication
deterministic identifiers
request signatures
verification hashes
internal integrity mechanisms
```

depending on the application design.

So we shouldn't look at this class and conclude:

> "This is how we should hash user passwords."

It isn't.

---

# 27. What our `generateHash()` pipeline really is

We can compress the entire method into this pipeline:

```text
input
  │
  ▼
HMAC-SHA256
  │
  │ key = hashSalt
  ▼
binary digest
  │
  ▼
Base64
  │
  ▼
URL-safe conversion
  │
  ▼
final string
```

More precisely, according to the implementation:

```text
input
  │
  ▼
createHmac("sha256", hashSalt)
  │
  ▼
.update(input)
  │
  ▼
.digest("base64")
  │
  ▼
Buffer.from(...)
  │
  ▼
.toString()
  │
  ▼
makeUrlSafe()
  │
  ├── + → -
  ├── / → _
  └── = → ""
  │
  ▼
final hash string
```

That's the complete architecture of this tiny class.

---

# 28. Why the coverage is 100%

Now the coverage result becomes much easier to understand.

Our implementation has essentially:

```ts
private constructor(...)
```

```ts
static createHashGenerator(...)
```

```ts
public generateHash(...)
```

```ts
private makeUrlSafe(...)
```

And our tests exercise:

```text
constructor
     ↑
factory test

createHashGenerator()
     ↑
tests 1, 2, 3, 4, 5, 6

generateHash()
     ↑
tests 3, 4, 5, 6

makeUrlSafe()
     ↑
tests 3, 4, 5, 6
```

There aren't any `if/else`, ternaries, loops, or other branches in this implementation.

Therefore:

```text
Statements = 100%
Branches   = 100%
Functions  = 100%
Lines      = 100%
```

is quite easy to achieve.

---

# 29. But there's an interesting limitation with our URL-safe test

Our test says:

```ts
expect(hash).not.toMatch(/[+/=]/);
```

This verifies the **final output** doesn't contain these characters.

But it doesn't necessarily prove that each replacement operation was individually executed.

For example, if a particular input happens to generate a Base64 value containing no `+`, `/`, or `=`, then:

```ts
.replace(/\+/g, '-')
```

doesn't actually replace anything during that test.

Yet Jest can still report:

```text
100% statements
100% lines
```

because the `.replace()` statement itself executed.

This demonstrates an important difference:

> **Code coverage tells us that code executed, not that every interesting input condition was meaningfully exercised.**

For this reason, 100% coverage should never be treated as proof that our tests are exhaustive.

---

# 30. The six tests are actually testing two categories

We can organize the suite more conceptually.

### Factory/object behavior

```text
1. Factory returns instance
2. Factory creates separate instances
```

### Hash behavior

```text
3. URL-safe output
4. Different inputs → different hashes
5. Different keys → different hashes
6. Empty input doesn't throw
```

And I'd add:

```text
7. Same input + same key → same hash
```

That gives us a stronger behavioral contract.

---

# 31. One improvement I'd make to the implementation

As mentioned earlier, this:

```ts
Buffer.from(
  createHmac('sha256', this.hashSalt)
    .update(input)
    .digest('base64')
).toString()
```

contains an unnecessary round trip:

```text
Base64 string
     ↓
Buffer
     ↓
string
```

We already have a string after:

```ts
.digest("base64")
```

So we can simplify:

```ts
public generateHash(input: string): string {
  return this.makeUrlSafe(
    createHmac("sha256", this.hashSalt)
      .update(input)
      .digest("base64"),
  );
}
```

Same conceptual pipeline:

```text
HMAC
 ↓
Base64 string
 ↓
URL-safe string
```

rather than:

```text
HMAC
 ↓
Base64 string
 ↓
Buffer
 ↓
string
 ↓
URL-safe string
```

The current code isn't necessarily broken; it's just more complicated than necessary.

---

# 32. The big testing lesson from this example

This exercise is actually teaching several important Jest principles at once.

We aren't mocking anything here.

Why?

Because `HashGenerator` is a small deterministic unit with no external dependency that needs isolation.

We're testing the **real implementation**.

Our test pattern is:

```text
Arrange
   ↓
Create real HashGenerator
   ↓
Act
   ↓
Call generateHash()
   ↓
Assert
   ↓
Verify behavior
```

For example:

```ts
const hashGenerator =
  HashGenerator.createHashGenerator(testSalt);

const hash =
  hashGenerator.generateHash(randInput);

expect(hash).not.toMatch(/[+/=]/);
```

That's classic **unit testing without mocks**.

---

# 33. Our final mental model

If we had to put the whole thing into our `.readme`, I'd summarize the class like this:

```text
HashGenerator
│
├── private hashSalt
│      └── HMAC secret/key
│
├── private constructor()
│      └── prevents direct `new HashGenerator()`
│
├── static createHashGenerator()
│      └── factory for creating instances
│
├── public generateHash(input)
│      │
│      ├── HMAC-SHA256
│      │      ├── key = hashSalt
│      │      └── message = input
│      │
│      ├── digest as Base64
│      │
│      └── makeUrlSafe()
│             ├── + → -
│             ├── / → _
│             └── = → removed
│
└── private makeUrlSafe()
       └── internal implementation detail
```

And our tests verify:

```text
Factory
  ├── creates HashGenerator
  └── creates independent instances

Hashing
  ├── produces URL-safe output
  ├── different input → different hash
  ├── different secret → different hash
  ├── empty input → no exception
  └── [recommended] same input + secret → same hash
```