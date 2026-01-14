### Components & Props Conventions
- Name the props type `Props`
  ```tsx
	type Props = {
	  title: string;
	};
	```
  > [!warning] If it is necessary to export the type, or if the file contains multiple components (which is discouraged), name the Props type appropriately
- When the component accepts `children`, use [[Architecture/Stack/React|React]]'s `PropsWithChildren`
  ```tsx
	import { PropsWithChildren } from 'react';
	type Props = PropsWithChildren<{ title: string }>;
    ```
- **Destructure props at the top of the component body**, rather than in the function signature. 
  This makes it clearer when debugging and allows easy refactoring (e.g., adding default values, logging, or spreading).
  > [!success] Preferred
  > ```tsx
  > export function Card(props: Props) {
  > 	const { title, children } = props;
  > 	return <div>{title}</div>;
  > }
  > ```

  > [!warning] Acceptable for simple components
  > ```tsx
  > export function Card({ title, children }: Props) {
  > 	return <div>{title}</div>;
  > }
  > ```
- Props order
	1. **key** prop
	2. ref prop
	3. **"Truthy" booleans** → use shorthand form (isEnabled, not isEnabled={true} or isEnabled={isEnabled} when always true)
	4.  **Constants / literals** → `prop={"value"}` or `prop={42}`
	5. **Variables / state values** → `prop={variable}`
	6. **Functions / event handlers** → `onClick={handleClick}`
	```tsx
	<Component
	  key={key}
	  ref={ref}
	  isEnabled
	  prop={"value"}
	  label={label}
	  onClick={handleClick}
	/>
	```
- Props destructure order
	1. **Variables** → `{ isEnabled }`
	2. **Variables with defaults** → `{ isEnabled = false }`
	3. **Functions** → `{ onClick }`
	4. **Functions with defaults** → `{ onClick = noop }`
	5. **Ref** → `{ ref }`
	6. **Children** → `{ children }`
	7. **Rest** → `{ ...rest }`
	```tsx
	export function Button(props: Props) {
		const {
			 title,
			 isDisabled = false,
			 onClick,
			 onClose = noop,
			 ref,
			 children,
			 ...rest
		} = props;
	}
	```
- Components should be defined as `function declarations`, you can use `arrow functions` for small, one-liner, components, or for components declared within other components / methods
- Do not use `React.FC`
  Prefer TypeScript’s natural inference — it’s simpler, safer, and avoids `children` confusion.
- Use the **Compound Component** pattern for elements that are **meant to be used together** (e.g. `Dropdown` + `Dropdown.Item`).
  ```tsx
	export const Dropdown = ({ children }: Props) => <div>{children}</div>;;
	Dropdown.Item = ({ children }: Props) => <div>{children}</div>;
	// or
	import { DropdownItem } from './DropdownItem.tsx';
	export const Dropdown = ({ children }: Props) => <div>{children}</div>;
	Dropdown.Item = DropdownItem;
	```
### React Hooks & Effects
- Follow [[Architecture/Stack/React|React]]’s [“You Might Not Need an Effect”](https://react.dev/learn/you-might-not-need-an-effect) guide — **avoid unnecessary effects**.
- When you **must** use effects for **event handling**, always pair them with [useEffectEvent](https://react.dev/reference/react/useEffectEvent)
- **Place the effect as the last hook** in the file for clarity and consistency.
### [[Shadcn]]
> [!warning] Do not add any files to the `@/components/ui` folder, only use `pnpm dlx shadcn@latest add [component]` to add ui components
- [[Files & Folders#^shadcn-naming-conventions|Naming Conventions]]
### [[TanStack Router]]
- If a route file needs to reference its `Route` variable, **re-export it** with a clearer name — but **do not remove the original `export const Route`** (TanStack Router requires it).
  ```tsx
	export const Route = createFileRoute('/users')({
		component: UsersPage,
	});
	
	function UsersPage() {}
		
	export { Route as UsersRoute };
	```
- Use **`staticData`** on routes for **shared layout or contextual data**, rather than passing props through nesting.
	```tsx
	export const Route = createFileRoute('/dashboard')({
	  component: Dashboard,
	  staticData: { links: [] },
	});
	```
- [[Files & Folders#^tanstack-router-naming-conventions|Naming Conventions]]
- Error Handling
	- Errors can be thrown in: 
		- beforeLoad, loader, onError -> ErrorComponent/NotFoundComponent/ErrorBoundary
		- within components -> ErrorComponent/ErrorBoundary
	- Errors cannot be thrown in: onCatch
- [Routing Concepts](https://tanstack.com/router/v1/docs/framework/react/routing/routing-concepts)
- [Create Route Property Order](https://tanstack.com/router/v1/docs/eslint/create-route-property-order)
