import {createBrowserRouter } from 'react-router';
import App from "./App";
import SignUpPage from './components/SignUpPage';
import SignInPage from './components/SignInPage';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import GroupPage from './components/GroupPage';
import JoinGroupPage from './components/JoinGroupPage';

export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup", element: (
            <PublicRoute>
                <SignUpPage />
            </PublicRoute>
        ),
    },
    {path: "/signin", element: (
            <PublicRoute>
                <SignInPage />
            </PublicRoute>
        ),
    },
    {path: "/dashboard", element: (
            <PrivateRoute>
                <Dashboard />
            </PrivateRoute>
        ),
    },
    {path: "/groups/:id", element: (
            <PrivateRoute>
                <GroupPage />
            </PrivateRoute>
        ),
    },
    {path: "/join/:code", element: (
            <PrivateRoute>
                <JoinGroupPage />
            </PrivateRoute>
        ),
    },
]);
