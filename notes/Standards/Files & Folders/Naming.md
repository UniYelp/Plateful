 File names should follow the `kebab-case` casing
```ts
// @file some-other-name.ts
```
## Special cases

- Files that export a single component need to be named the same as the exported component (`PascalCase`)
  ```tsx
    // @file Component.tsx
    export function Component() {}
  ```
- File that export a single hook need to be named the same as the exported hook (`camelCase`)
  ```tsx
    // @file useHook.tsx
    export const useHook = () => {}
  ```
- For the `routes` folder in the [[Web]] app, follow [[TanStack Router]]'s official [naming conventions](https://tanstack.com/router/latest/docs/framework/react/routing/file-naming-conventions)
