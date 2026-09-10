# Understanding Code Coverage

Code coverage is a metric that measures how much of your source code is executed during testing. It helps identify untested code paths and potential gaps in your test suite. Coverage tracks different aspects like lines executed, functions called, and branches (if/else paths) tested. While understanding coverage is valuable, as a developer you typically don't need to set up the coverage configuration yourself - it's usually already configured in production projects by the team lead or DevOps. Your main responsibility is to write comprehensive tests that meet the established coverage thresholds (commonly set at 80% or higher). When you run tests, the coverage report will show you if your tests meet these thresholds, and if not, which parts of the code need additional testing. Think of coverage thresholds as quality gates that ensure your code is adequately tested before it can be merged into the main codebase.

**Jest Coverage Configuration**

## Basic Coverage Settings

```typescript
collectCoverage: true,           // Enables coverage collection
coverageDirectory: 'coverage',   // Directory where coverage reports are saved
```

## Coverage Reporters

```typescript
coverageReporters: ['text', 'lcov', 'clover', 'html'],
```

- `text`: Outputs coverage results to the console
- `lcov`: Generates report for tools like Coveralls/SonarQube
- `clover`: Creates an XML report for CI tools
- `html`: Creates a detailed HTML report for browser viewing

You can pick and choose which reporters you need for your project.

## Coverage Thresholds

```typescript
coverageThreshold: {
  global: {
    branches: 80,    // % of branch coverage required
    functions: 80,   // % of function coverage required
    lines: 80,       // % of line coverage required
    statements: 80,  // % of statement coverage required
  }
}
```

These thresholds will cause tests to fail if coverage falls below 80%:

- `branches`: Ensures code paths in control structures (if/else, switch) are tested
- `functions`: Measures how many functions were called during tests
- `lines`: Tracks how many lines of code were executed
- `statements`: Monitors execution of individual statements

## Files to Include/Exclude

```typescript
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}', // Include all JS/TS files in src
  '!src/**/*.d.ts', // Exclude TypeScript declaration files
  '!src/**/*.stories.{js,jsx,ts,tsx}', // Exclude Storybook files
  '!src/**/*.test.{js,jsx,ts,tsx}', // Exclude test files
  '!src/setupTests.*', // Exclude test setup files
];
```

- Uses glob patterns to specify which files to include/exclude
- `!` prefix means exclude the pattern
- Ensures coverage is only collected from actual source code

This configuration ensures comprehensive test coverage while excluding irrelevant files from the coverage report.
