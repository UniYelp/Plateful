### Type vs Interface

Prefer `type` over `interface`** unless you are **extending a large built-in type** (for example, `React.HTMLAttributes`, `HTMLDivElement`, etc.).
```ts
// ✅ Preferred
type User = { id: string; name: string }

// ⚠️ Acceptable (for large built-ins)
interface Props extends React.HTMLAttributes<HTMLDivElement> {}
```

