import { UserAuth } from '../Context/AuthContext'
import {useNavigate} from "react-router"

const Dashboard = () => {
const {session, signOut} = UserAuth();
const navigate = useNavigate();

const handleSignOut = async (e) => {
    e.preventDefault();
    await signOut();
    navigate("/signin");
   
};

    return (
        <div className="max-w-md mx-auto pt-24">
            <div className="border rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-2">Panel główny</h1>
                <h2 className="text-gray-600">Witaj, {session?.user?.user_metadata?.display_name || session?.user?.email}!</h2>
                
                <button
                    onClick={handleSignOut}
                    className='mt-6 w-full border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 cursor-pointer inline-block'>
                    Wyloguj się
                    </button>
            </div>
        </div>
    )
}

export default Dashboard