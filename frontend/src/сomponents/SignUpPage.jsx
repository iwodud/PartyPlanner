import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { UserAuth } from '../Context/AuthContext';

const SignUpPage = () => {
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState(""); 
    const [loading, setLoading] = useState(false); 

    const {signUpNewUser } = UserAuth();
    const navigate = useNavigate()

    const handleSignUp = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("")

        if (!email.trim()) {
            setError("Podaj adres e-mail")
            return
        }

        if (!email.includes("@")) {
            setError("Nieprawidłowy format adresu e-mail")
            return
        }
        
        if (!password) {
            setError("Podaj hasło")
            return
        }

        if (password.length < 6) {
            setError("Hasło musi mieć co najmniej 6 znaków")
            return
        }

        if (!confirmPassword) {
            setError("Powtórz hasło")
            return
        }
        
        
        if (password !== confirmPassword) {
            setError("Hasła nie są identyczne")
            return
        }
        

        setLoading(true)

        try {
            const result = await signUpNewUser(email, password)

            if(result.success) {
                if(result.data.session) {
                    navigate('/dashboard') 
                } else {

                    setMessage("Konto utworzone! Sprawdź skrzynkę e-mail, aby potwierdzić rejestrację.")

                }

            
            } else if(result.error.code === 'user_already_exists') {
                setError("Konto z tym adresem e-mail już istnieje")

            } else {
                setError("Wystąpił problem podczas rejestracji")
            }

        } catch(err) {
            setError("Coś poszło nie tak. Spróbuj ponownie");
        } finally {
            setLoading(false)
        }

    };

    return (
        <div>
            <form onSubmit={handleSignUp} className='max-w-md m-auto pt-24'>
                <h2 className='font-bold pb-2'>Rejestracja</h2>
                <p>
                    Masz już konto? <Link to='/signin' className="text-green-600 underline hover:text-green-800">Zaloguj się</Link>
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

                    <input 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        
                        placeholder='Powtórz hasło' 
                        className='p-3 mt-6 border rounded' 
                        type='password'>
                    </input>

                    <button
                        type='submit' 
                        disabled={loading} 
                        className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50" 
                    >
                        Zarejestruj
                    </button> 
                    {error && <p className="text-red-600 text-center pt-4">{error}</p>}
                    {message && <p className="text-green-600 text-center pt-4">{message}</p>}
                </div>

            </form>
        </div>
    )
}

export default SignUpPage