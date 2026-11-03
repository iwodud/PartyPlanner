import { UserAuth } from "../Context/AuthContext";
import { Navigate } from "react-router";

// Strony logowania i rejestracji są dostępne tylko dla niezalogowanych
const PublicRoute = ({ children }) => {
    const { session } = UserAuth();

    if (session === undefined) {
        return <p>Ładowanie..</p>;
    }

    return session ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute
