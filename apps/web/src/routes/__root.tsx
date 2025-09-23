import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { TanstackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { convexClient } from '@/configs/convex.config';
import { ENV } from '@/configs/env.config';

export const Route = createRootRoute({
    component: () => (
        <>
            <ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}>
                <ConvexProviderWithClerk
                    client={convexClient}
                    useAuth={useAuth}
                >
                    <Outlet />
                </ConvexProviderWithClerk>
            </ClerkProvider>
            <TanstackDevtools
                config={{
                    position: 'bottom-left',
                    hideUntilHover: true,
                }}
                plugins={[
                    {
                        name: 'Tanstack Router',
                        render: <TanStackRouterDevtoolsPanel />,
                    },
                ]}
            />
        </>
    ),
});
