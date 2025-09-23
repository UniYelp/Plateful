import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/layouts/Header';

export const Route = createFileRoute('/(app)')({
    component: AppLayout,
});

function AppLayout() {
    return (
        <div className='min-h-screen bg-background'>
            <Header />
            <Outlet />
        </div>
    );
}
