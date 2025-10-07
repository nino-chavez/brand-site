# Canonical Standards - OVERRIDE Existing Code Patterns

## Purpose
Defines objective best practices that OVERRIDE patterns found in existing codebase.

**CRITICAL RULE:**
When existing code conflicts with these standards, these standards win.
Do NOT normalize bad patterns by replicating them.

---

## React Component Standards

### ❌ NEVER Acceptable (Even if Found in Codebase)

#### 1. Manual DOM Manipulation
```tsx
// ❌ WRONG (even if you find it elsewhere)
element.style.transform = `translateX(${x}px)`;
element.style.opacity = '0.5';

// ✅ CORRECT
<motion.div
  animate={{ x, opacity: 0.5 }}
  transition={{ type: "spring" }}
/>
```

**Why:** React owns the DOM. Manual manipulation breaks reconciliation.

#### 2. Mixed Animation Approaches
```tsx
// ❌ WRONG (common smell found in codebase)
const [position, setPosition] = useState({x: 0});
element.style.transform = `translateX(${position.x}px)`;

// ✅ CORRECT - Pick ONE
// Option A: Framer Motion
<motion.div animate={{ x: position.x }} />

// Option B: CSS Classes
<div className={cx({ 'translate-x-0': position.x === 0 })} />
```

**Why:** Mixing approaches creates race conditions and performance issues.

#### 3. Hardcoded Magic Numbers
```tsx
// ❌ WRONG
if (viewport.width > 768) { }
const PANEL_WIDTH = 480;

// ✅ CORRECT
if (viewport.width > breakpoints.md) { }
const PANEL_WIDTH = tokens.layout.panelWidth;
```

**Why:** Duplication, lack of single source of truth.

#### 4. Prop Drilling >2 Levels
```tsx
// ❌ WRONG
<GrandParent>
  <Parent data={data}>
    <Child data={data}>
      <GrandChild data={data} />
    </Child>
  </Parent>
</GrandParent>

// ✅ CORRECT
const DataContext = createContext();
<DataProvider value={data}>
  <GrandChild />  {/* useContext(DataContext) */}
</DataProvider>
```

**Why:** Maintenance nightmare, tight coupling.

#### 5. Inline Event Handler Creation
```tsx
// ❌ WRONG (causes re-renders)
<button onClick={() => handleClick(id)}>

// ✅ CORRECT
const handleClickWithId = useCallback(() => handleClick(id), [id]);
<button onClick={handleClickWithId}>
```

**Why:** Creates new function every render, breaks memoization.

#### 6. useEffect Without Dependencies
```tsx
// ❌ WRONG (infinite loop or stale closures)
useEffect(() => {
  doSomething(value);
});

// ✅ CORRECT
useEffect(() => {
  doSomething(value);
}, [value]);
```

**Why:** Leads to bugs, performance issues.

---

## TypeScript Standards

### ❌ NEVER Acceptable

#### 1. `any` Type
```tsx
// ❌ WRONG
function process(data: any) { }

// ✅ CORRECT
function process(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type guard
  }
}
```

**Why:** Defeats the purpose of TypeScript.

#### 2. Non-Null Assertion Without Guard
```tsx
// ❌ WRONG
const value = data!.property;

// ✅ CORRECT
if (!data) throw new Error('Data required');
const value = data.property;
```

**Why:** Runtime errors, defeats type safety.

#### 3. Implicit Type Coercion
```tsx
// ❌ WRONG
if (value) { }  // boolean coercion

// ✅ CORRECT
if (value !== null && value !== undefined) { }
if (array.length > 0) { }
```

**Why:** Hides bugs (0, "", null, undefined all falsy).

---

## Architecture Standards

### ❌ NEVER Acceptable

#### 1. Business Logic in Components
```tsx
// ❌ WRONG
function UserProfile() {
  const calculateAge = (birthday) => {
    const diff = Date.now() - birthday.getTime();
    return new Date(diff).getFullYear() - 1970;
  };

  return <div>{calculateAge(user.birthday)}</div>;
}

// ✅ CORRECT
// utils/user.ts
export const calculateAge = (birthday: Date): number => { };

// Component
function UserProfile() {
  return <div>{calculateAge(user.birthday)}</div>;
}
```

**Why:** Hard to test, couples logic to UI.

#### 2. Direct API Calls in Components
```tsx
// ❌ WRONG
function UserList() {
  useEffect(() => {
    fetch('/api/users').then(setUsers);
  }, []);
}

// ✅ CORRECT
// services/userService.ts
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);
  return users;
};

// Component
function UserList() {
  const users = useUsers();
}
```

**Why:** Separation of concerns, testability, reusability.

#### 3. Circular Dependencies
```tsx
// ❌ WRONG
// fileA.ts
import { B } from './fileB';

// fileB.ts
import { A } from './fileA';

// ✅ CORRECT
// shared.ts
export type SharedType = { };

// fileA.ts
import { SharedType } from './shared';

// fileB.ts
import { SharedType } from './shared';
```

**Why:** Build errors, runtime issues, hard to reason about.

---

## Performance Standards

### ❌ NEVER Acceptable

#### 1. Unthrottled Event Handlers
```tsx
// ❌ WRONG
window.addEventListener('scroll', handleScroll);
window.addEventListener('resize', handleResize);

// ✅ CORRECT
window.addEventListener('scroll', throttle(handleScroll, 16));  // 60fps
window.addEventListener('resize', debounce(handleResize, 150));
```

**Why:** Performance degradation, jank.

#### 2. Large Bundles Without Code Splitting
```tsx
// ❌ WRONG
import HugeLibrary from 'huge-library';  // 500KB

// ✅ CORRECT
const HugeLibrary = lazy(() => import('huge-library'));
<Suspense fallback={<Loading />}>
  <HugeLibrary />
</Suspense>
```

**Why:** Slow initial load, poor UX.

#### 3. N+1 Queries
```tsx
// ❌ WRONG
users.forEach(user => {
  const posts = await fetchUserPosts(user.id);  // N queries
});

// ✅ CORRECT
const userIds = users.map(u => u.id);
const posts = await fetchPostsByUsers(userIds);  // 1 query
```

**Why:** Performance kill, doesn't scale.

---

## Git Commit Standards

### ❌ NEVER Acceptable

#### 1. Vague Commit Messages
```
❌ "fix bugs"
❌ "update code"
❌ "changes"

✅ "fix: panel positioning - align with clicked card (Playwright verified)"
✅ "refactor: extract business logic from UserProfile component"
```

#### 2. Mixed Concerns in Single Commit
```
❌ Commit contains:
- New feature
- Bug fix
- Refactor
- Dead code removal

✅ One commit per concern
```

#### 3. Committing Without Verification
```
❌ "fix: UI bug" (no testing mentioned)

✅ "fix: UI bug - verified with Playwright, inspected DOM"
```

---

## Enforcement in Quality Gates

### Pre-Commit Hook Enhancement

Add to `.git/hooks/pre-commit`:

```bash
# Check 6: Canonical Standards Compliance
echo "📋 Check 6: Checking canonical standards compliance..."

# Detect manual DOM manipulation
if git diff --cached | grep -E "\.style\.(transform|opacity|top|left|width|height)" | head -1 > /dev/null; then
  echo -e "${RED}❌ BLOCKING: Manual DOM manipulation detected${NC}"
  echo "   Use Framer Motion or CSS classes instead"
  echo "   See: .claude/agents/intelligence/canonical-standards.md#1-manual-dom-manipulation"
  EXIT_CODE=1
fi

# Detect 'any' type
if git diff --cached | grep -E ": any[,;]| any\[" | head -1 > /dev/null; then
  echo -e "${RED}❌ BLOCKING: 'any' type detected${NC}"
  echo "   Use proper types or 'unknown' with type guards"
  echo "   See: .claude/agents/intelligence/canonical-standards.md#1-any-type"
  EXIT_CODE=1
fi

# Detect unthrottled event listeners
if git diff --cached | grep -E "addEventListener\('(scroll|resize|mousemove)" | head -1 > /dev/null; then
  if ! git diff --cached | grep -E "throttle|debounce" | head -1 > /dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: Event listener without throttle/debounce${NC}"
    echo "   Consider throttling for performance"
    echo "   See: .claude/agents/intelligence/canonical-standards.md#1-unthrottled-event-handlers"
  fi
fi
```

---

## Decision Tree for Code Conflicts

```
Found pattern X in existing code
       ↓
Does X violate canonical standards?
  ├─ YES → Use canonical standard (ignore existing code)
  │        Document why old code is wrong
  │        Consider refactoring old code later
  │
  └─ NO  → Check if X is idiomatic/consistent
            ├─ YES → Follow existing pattern
            └─ NO  → Use canonical standard
```

---

## Examples of Overriding Bad Patterns

### Example 1: Found Manual DOM Manipulation

```tsx
// Found in FrameSection.tsx (WRONG)
cardRef.current.style.transform = `rotateX(${rotateX}deg)`;

// DO NOT REPLICATE - Use canonical standard:
<motion.div
  whileHover={{ rotateX: rotateX }}
  transition={{ type: "spring" }}
>
```

### Example 2: Found Inline Event Handlers

```tsx
// Found in WorkSection.tsx (WRONG)
<button onClick={() => handleClick(id)}>

// DO NOT REPLICATE - Use canonical standard:
const handleClickWithId = useCallback(() => handleClick(id), [id]);
<button onClick={handleClickWithId}>
```

### Example 3: Found 'any' Types

```tsx
// Found in old util (WRONG)
function process(data: any) {
  return data.property;
}

// DO NOT REPLICATE - Use canonical standard:
interface DataType {
  property: string;
}

function process(data: DataType) {
  return data.property;
}
```

---

## Maintenance

### Adding New Standards

1. Identify anti-pattern causing issues
2. Document why it's wrong
3. Provide correct alternative
4. Add detection to pre-commit hook
5. Audit existing code (optional cleanup)

### Evolving Standards

Standards can be updated if:
- New React/TypeScript best practices emerge
- Performance requirements change
- Team consensus on better approach

**Process:**
1. Discuss in team
2. Update this document
3. Update pre-commit checks
4. Announce change
5. Optional: Refactor existing violations

---

## Related Documentation

- [Commit Quality Gate](.claude/agents/commit-quality-gate.md)
- [Pre-Modification Protocol](.claude/agents/intelligence/pre-modification-protocol.md)
- [Project Standards](.claude/CLAUDE.md)
