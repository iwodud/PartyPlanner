import { UserAuth } from "../Context/AuthContext";
import { Navigate, useLocation } from "react-router";

// Strony logowania i rejestracji są dostępne tylko dla niezalogowanych
const PublicRoute = ({ children }) => {
    const { session } = UserAuth();
    const location = useLocation();

    if (session === undefined) {
        return <p>Ładowanie..</p>;
    }

    return session ? <Navigate to={location.state?.from || "/dashboard"} replace /> : children;
};

export default PublicRoute
