# Development Best Practices

## Context

Global development guidelines for Agent OS projects.

## Core Principles

### Keep It Simple
- Implement code in the fewest lines possible
- Avoid over-engineering solutions
- Choose straightforward approaches over clever ones

### Optimize for Readability
- Prioritize code clarity over micro-optimizations
- Write self-documenting code with clear variable names
- Add comments for "why" not "what"

### DRY (Don't Repeat Yourself)
- Extract repeated business logic to private methods
- Extract repeated UI markup to reusable components
- Create utility functions for common operations

## Next.js Best Practices

### Data Fetching
- Prefer Server Components for data fetching when possible.
- Use Server Actions for mutations.
- Utilize `use client` for interactive components only.

### Routing
- Leverage App Router for nested layouts and routing.
- Use `next/link` for client-side navigation.

### Environment Variables
- Prefix client-side environment variables with `NEXT_PUBLIC_`.
- Keep server-side environment variables private.

## Testing Best Practices

### Test Strategy
- **3-Tier Approach**: Unit tests (fast, mocked), Integration tests (DB-dependent), E2E tests (browser)
- **Test-Driven Development**: Write tests before or alongside implementation
- **Test Independence**: Each test should be able to run in isolation

### Mocking Guidelines
- **NO global mocks** in `__mocks__/` directories - causes spy conflicts
- **Use test utilities** from `__tests__/__utils__/testUtils.ts` for consistent mocking
- **Mock external dependencies** but test internal logic thoroughly
- **Component tests**: Mock Supabase using `createMockSupabaseClient()`

### Test Organization
- **Unit tests**: `__tests__/*.test.(ts|tsx)` - Pure logic testing
- **Integration tests**: `__tests__/integration/*.test.ts` - Database interactions
- **E2E tests**: `e2e/*.spec.ts` - Full application flows
- **Utilities**: `__tests__/__utils__/` - Shared test helpers (excluded from test runs)

### API Route Testing
- **Avoid direct imports** of API route handlers in unit tests
- **Test via HTTP calls** or move to integration tests
- **Use proper Request/Response mocking** for Next.js compatibility

## TypeScript Error Resolution Protocol

### CRITICAL: Investigation Before Implementation
**Never jump to code fixes based on TypeScript error messages alone.**

#### 1. Systematic Error Analysis
```typescript
// WRONG: Immediately adding type assertions to silence errors
const data = response.data as any[];

// RIGHT: Investigate why the type error exists
// 1. Check actual data structure
// 2. Verify TypeScript definitions are current
// 3. Address root cause (schema mismatch, outdated types, etc.)
```

#### 2. Database-Related Error Checklist
When encountering Supabase/database TypeScript errors:

```bash
# Step 1: Verify actual database schema
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "\d table_name"

# Step 2: List all columns
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'table_name' ORDER BY column_name;"

# Step 3: Regenerate types if schema changed
npx supabase gen types typescript --local > lib/supabase/types.ts
```

#### 3. Red Flag Error Messages
**Stop and investigate further when you see:**
- `SelectQueryError<"column 'X' does not exist">`
- `Property 'Y' does not exist on type 'SelectQueryError'`
- Multiple related errors in "established and tested code"
- Errors mentioning non-existent database objects

These indicate **real architectural problems**, not TypeScript compiler issues.

#### 4. Error Triage Decision Tree

1. **Schema Mismatch** (table/column doesn't exist):
   - ✅ Check actual database schema
   - ✅ Update TypeScript types if outdated
   - ✅ Fix database queries to match real schema
   - ❌ Never modify code to work around schema errors

2. **Type Inference Issues**:
   - ✅ Add explicit type annotations
   - ✅ Use proper generic types
   - ❌ Don't use `any` or random type assertions

3. **Import/Export Problems**:
   - ✅ Verify actual exports in target files
   - ✅ Check import paths are correct
   - ❌ Don't create dummy exports to silence errors

#### 5. Recovery Protocol
If you realize you've made incorrect fixes:
1. **Stop immediately** - don't compound the problem
2. **Revert changes**: `git restore filename.ts`
3. **Re-investigate** with fresh perspective
4. **Document lessons learned**

#### 6. Agent-Specific Guidelines
When using the Task tool for complex investigations:
- Launch `general-purpose` agent for schema verification
- Use `coding-standards-reviewer` for architectural analysis
- Prefer investigation agents over implementation agents for error diagnosis

**Remember: TypeScript errors are symptoms, not diseases. Always treat the root cause.**

## Dependencies

### Choose Libraries Wisely
When adding third-party dependencies:
- Select the most popular and actively maintained option
- Check the library's GitHub repository for:
  - Recent commits (within last 6 months)
  - Active issue resolution
  - Number of stars/downloads
  - Clear documentation