import { Navigate } from "react-router"
import { UserAuth } from "./Context/AuthContext"

function App() {
  const { session } = UserAuth();

  if (session === undefined) {
    return <p>Ładowanie..</p>;
  }

  return <Navigate to={session ? "/dashboard" : "/signin"} replace />
}

export default App
