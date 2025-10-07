import {
	type TanStackDevtoolsReactPlugin,
	TanstackDevtools,
} from "@tanstack/react-devtools";
import { FormDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export function Devtools() {
	return (
		<TanstackDevtools
			config={{
				position: "bottom-left",
				hideUntilHover: true,
			}}
			plugins={[
				{
					name: "TanStack Router",
					render: <TanStackRouterDevtoolsPanel />,
				},
				{
					name: "TanStack Query",
					render: <ReactQueryDevtoolsPanel />,
				},
				FormDevtoolsPlugin() as TanStackDevtoolsReactPlugin,
			]}
		/>
	);
}
