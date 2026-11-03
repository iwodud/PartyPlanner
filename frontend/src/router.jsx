import {createBrowserRouter } from 'react-router';
import App from "./App";
import SignUpPage from './сomponents/SignupPage';
import SignInPage from './сomponents/SignInPage';
import Dashboard from './сomponents/Dashboard';
import PrivateRoute from './сomponents/PrivateRoute';

export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup", element: <SignUpPage />},
    {path: "/signin", element: <SignInPage />},
    {path: "/dashboard", element: (
            <PrivateRoute>
                <Dashboard /> {" "}
            </PrivateRoute>

        ),
    },
]);