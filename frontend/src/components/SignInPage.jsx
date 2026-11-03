import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { UserAuth } from '../Context/AuthContext';
import { isValidEmail } from '../utils/validation';

const SignInPage = () => {
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [error, setError] = useState(""); 
    const [loading, setLoading] = useState(false); 

    const { signInUser } = UserAuth();
    const navigate = useNavigate()

    const handleSignIn = async (e) => {
        e.preventDefault()
        setError("")

        if (!email.trim()) {
            setError("Podaj adres e-mail")
            return
        }

        if (!isValidEmail(email)) {
            setError("Nieprawidłowy format adresu e-mail")
            return
        }
        
        if (!password) {
            setError("Podaj hasło")
            return
        }
        

        

        setLoading(true)

        try {
            const result = await signInUser(email, password)

            if(result.success) {
                    navigate('/dashboard') 
            
            } else if(result.error.code === 'invalid_credentials') {
                setError("Nieprawidłowy e-mail lub hasło")

            } else if (result.error.code === 'email_not_confirmed') {
                setError("Adres e-mail nie został potwierdzony. Sprawdź skrzynkę.")

            } else if (result.error.code === 'over_request_rate_limit') {
                setError("Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut")

            } else {
                setError("Wystąpił problem podczas logowania")
            }

        } catch {
            setError("Coś poszło nie tak. Spróbuj ponownie");
        } finally {
            setLoading(false)
        }

    };

    return (
        <div>
            <form onSubmit={handleSignIn} className='max-w-md m-auto pt-24'>
                <h2 className='font-bold pb-2'>Logowanie</h2>
                <p>
                    Nie masz konta? <Link to='/signup' className="text-green-600 underline hover:text-green-800">Zarejestruj się</Link>
                </p>

                <div className='flex flex-col py-4'>
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder='Email' 
                        className='p-3 mt-6 border rounded' 
                        type='email'>

                    </input>
                    <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder='Hasło' 
                        className='p-3 mt-6 border rounded' 
                        type='password'>
                    </input>

                    <button
                        type='submit' 
                        disabled={loading} 
                        className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50" 
                    >
                        Zaloguj
                    </button> 
                    {error && <p className="text-red-600 text-center pt-4">{error}</p>}
                </div>

            </form>
        </div>
    )
}

export default SignInPage