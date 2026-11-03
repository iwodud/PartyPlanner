import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { joinErrorMessage, joinGroup } from '../Context/groupsApi';

// Strona otwierana z linku zaproszenia: /join/:code
const JoinGroupPage = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    // StrictMode w trybie dev odpala efekty dwa razy; dołączamy tylko raz
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        joinGroup(code)
            .then((groupId) => navigate(`/groups/${groupId}`, { replace: true }))
            .catch((err) => {
                console.error("Błąd dołączania do grupy: ", err);
                setError(joinErrorMessage(err));
            });
    }, [code, navigate]);

    return (
        <div className="max-w-md mx-auto pt-24">
            <div className="border rounded-lg shadow-md p-6">
                {error ? (
                    <>
                        <p className="text-red-600">{error}</p>
                        <Link to="/dashboard" className="inline-block mt-4 text-green-600 underline hover:text-green-800">
                            ← Wróć do panelu
                        </Link>
                    </>
                ) : (
                    <p>Dołączanie do grupy..</p>
                )}
            </div>
        </div>
    );
};

export default JoinGroupPage
