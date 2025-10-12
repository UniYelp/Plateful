## Project & File Organization
### General Structure
- **Multi-export files** should ideally be split into separate files: `{name} → {name}/{...}`
- **Avoid barrel files** (`index.ts`) when possible, except for designated _public_ feature entry points.
- **Within a folder**, use **direct (relative)** imports even if an index barrel exists.  
  ❌ Bad `import { X } from '.'`
  ✅ Good `import { X } from './X'`
- Shared business logic:
	- If logic is shared **within a single app**, place it under `<APP_ROOT>/src/features/{feature}/{...}`
	- If logic is shared between multiple apps, move it to `<ROOT>/packages/{feature}/{...}`

- **App-wide code** (cross-feature utilities) belongs in the app’s `src` root
  ```
		src/
			components/{...}
			utils/{...}
			types/{...}
			{...}
	```
- **Feature** folders should:
	- Re-export all _public_ symbols via an `index.ts` barrel files.
	- Use direct imports internally, not from the feature’s barrel.
	- Contain feature-specific code
		```
		features/
			{feature}/
				index.ts // public exports
				components/{...}
				utils/{...}
				types/{...}
				{...}
		```

### Conventions
- **Config files** belong in the `configs` folder and use the `.config.ts` suffix: `configs/app.config.ts`
- Constants live in either `consts.ts` or a `consts/{...}` folder.
- Utility functions go in `utils.ts` or a `utils/{...}` folder.
- Helper functions (business-logic oriented) go in `helpers.ts` or a `helpers/{...}` folder.
- **File names should not repeat their folder name.**  
  ❌ `{feature}/{feature}Component.tsx`  
  ✅ `{feature}/component.tsx`
- **Type-only re-exports** must explicitly use the `export type` form
  ```ts
	export type * from './types'
	```
- **Package names** must follow the naming convention: `@plateful/{name}` or `@plateful.{sub-purpose}/{name}`.
	- `@plateful/web`
	- `@plateful.tests/utils`

## Naming Conventions
### File Names
- **Default casing:**
  All file names should use **`kebab-case`**.
  `// @file some-other-name.ts`
### Special Cases
- **Component files:**
  Use the same name as the exported component in **`PascalCase`**.
  ```tsx
    // @file Component.tsx
    export function Component() {}
    ```
- **Hook files:**  
  Use the same name as the exported hook in **`camelCase`**.
  ```tsx
    // @file useHook.tsx
    export const useHook = () => {}
    ```
- **Shadcn ui:**
  In the [[Web]] app's `components/ui/` directory, do not modify the names of the files created by the `shadcn cli` ^shadcn-naming-conventions
- **Route files:**
  In the [[Web]] app’s `routes/` directory, follow [[TanStack Router]]'s official [naming conventions](https://tanstack.com/router/latest/docs/framework/react/routing/file-naming-conventions) ^tanstack-router-naming-conventions
