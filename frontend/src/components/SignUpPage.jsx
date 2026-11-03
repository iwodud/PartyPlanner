import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { UserAuth } from '../Context/AuthContext';
import { isValidEmail, MIN_PASSWORD_LENGTH } from '../utils/validation';

const SignUpPage = () => {
    const [displayName, setDisplayName] = useState("");
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

        if (!displayName.trim()) {
            setError("Podaj nazwę wyświetlaną")
            return
        }

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

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków`)
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
            const result = await signUpNewUser(email, password, displayName)

            if(result.success) {
                if(result.data.session) {
                    navigate('/dashboard') 
                } else {

                    setMessage("Konto utworzone! Sprawdź skrzynkę e-mail, aby potwierdzić rejestrację.")

                }

            
            } else if(result.error.code === 'user_already_exists') {
                setError("Konto z tym adresem e-mail już istnieje")

            } else if (result.error.code === 'weak_password') {
                setError("Hasło jest zbyt słabe. Użyj dłuższego hasła z literami i cyframi")

            } else if (result.error.code === 'over_email_send_rate_limit') {
                setError("Zbyt wiele prób rejestracji. Spróbuj ponownie za kilka minut")

            } else {
                setError("Wystąpił problem podczas rejestracji")
            }

        } catch {
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
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder='Nazwa wyświetlana'
                        className='p-3 mt-6 border rounded'
                        type='text'>
                    </input>
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