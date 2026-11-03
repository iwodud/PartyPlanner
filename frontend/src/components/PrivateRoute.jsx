import { UserAuth } from "../Context/AuthContext";
import { Navigate, useLocation } from "react-router";

const PrivateRoute = ({ children }) => {
    const { session } = UserAuth();
    const location = useLocation();

    if (session === undefined) {
        return <p>Ładowanie..</p>;
    }

    // Zapamiętujemy, dokąd użytkownik szedł (np. link zaproszenia), żeby wrócić tam po zalogowaniu
    return session ? children : <Navigate to="/signin" state={{ from: location.pathname }} replace />;
};

export default PrivateRoute