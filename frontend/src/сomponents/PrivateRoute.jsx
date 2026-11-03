import { UserAuth } from "../Context/AuthContext";
import { Navigate } from "react-router";

const PrivateRoute = ({ children }) => {
    const { session } = UserAuth();

    if (session === undefined) {
        return <p>Ładowanie..</p>;
    }

    return session ? children : <Navigate to="/signin"/>; 
};

export default PrivateRoute