import { createFileRoute } from '@tanstack/react-router';
import logo from '../logo.svg';
import '../App.css';
import { api } from '@backend/_generated/api';
import { SignInButton, UserButton } from '@clerk/clerk-react';
import {
    Authenticated,
    AuthLoading,
    Unauthenticated,
    useQuery,
} from 'convex/react';

export const Route = createFileRoute('/')({
    component: App,
});

function App() {
    return (
        <div className='App'>
            <header className='App-header'>
                <img src={logo} className='App-logo' alt='logo' />
                <p>
                    Edit <code>src/routes/index.tsx</code> and save to reload.
                </p>
                <a
                    className='App-link'
                    href='https://reactjs.org'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    Learn React
                </a>
                <a
                    className='App-link'
                    href='https://tanstack.com'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    Learn TanStack
                </a>
            </header>
            <main>
                <Unauthenticated>
                    <SignInButton />
                </Unauthenticated>
                <Authenticated>
                    <UserButton />
                    <Content />
                </Authenticated>
                <AuthLoading>
                    <p>Still loading</p>
                </AuthLoading>
            </main>
        </div>
    );
}

function Content() {
    const tasks = useQuery(api.tasks.getTasks);
    return <div>Authenticated content: {tasks?.length}</div>;
}
