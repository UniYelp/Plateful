### Type vs Interface

Prefer `type` over `interface`** unless you are **extending a large built-in type** (for example, `React.HTMLAttributes`, `HTMLDivElement`, etc.).
```ts
// ✅ Preferred
type User = { id: string; name: string }

// ⚠️ Acceptable (for large built-ins)
interface Props extends React.HTMLAttributes<HTMLDivElement> {}
```


### Enums

> [!danger] Do not use the `enum` keyword
> ```ts
> enum DoNotUseThisKeyword {}
> ```
- Prefer object-based enums with as const and type "aliasing".
  ```ts
	const Value = {
	  BOB: 'bob',
	  BERT: 'bert',
	} as const;
	
	type Value = (typeof Value)[keyof typeof Value];
	// or
	type Value = ValueOf<typeof Value>;
	  ```
- Prefer object enums over array enums.
  You can always derive the values:
  ```ts
	const EnumValues = Object.values(EnumValue);
	```
#### Naming Conventions
- **Name**: **`PascalCase`**, singular
- **Keys**: **`SCREAMING_SNAKE_CASE`**
- **Values**: ideally **`kebab-case`**, but this depends on context (e.g., if integrating with APIs).
```ts
const EnumValue = {
	BOB: "bob",
	BERT: "bert",
	ANOTHER_ONE: "another-one"
} as const;
export type EnumValue = ValueOf<typeof EnumValue>;
```

### Mappers
Used for consistent mappings between enums or domains (e.g., DB ↔ UI, type ↔ label, etc.).
#### Naming Conventions
- **Name**: **`camelCase`**, xByY
- **Type**: `Record<X, Y>`
- **Keys**: Should be based on the values of x (e.g., `ValueOf<typeof X>`).
- **Values**: Should represent the corresponding `y` (label, code, etc.).
- Do not type case, instead use `as const` + `satisfies`
  ```ts
	const colorByStatus = {
	  [Status.Draft]: 'gray',
	  [Status.Published]: 'green',
	  [Status.Archived]: 'red',
	} as const satisfies Record<Status, string>;
    ```
    