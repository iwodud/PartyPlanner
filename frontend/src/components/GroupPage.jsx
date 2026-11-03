import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { UserAuth } from '../Context/AuthContext';
import {
    deleteGroup,
    fetchGroup,
    fetchProfiles,
    inviteLink,
    leaveGroup,
    regenerateInviteCode,
} from '../Context/groupsApi';

const GroupPage = () => {
    const { id } = useParams();
    const { session } = UserAuth();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [copied, setCopied] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const groupData = await fetchGroup(id);

                // RLS ukrywa grupy, do których użytkownik nie należy
                if (!groupData) {
                    setError("Grupa nie istnieje albo nie jesteś jej członkiem");
                    return;
                }

                setGroup(groupData);
                setMembers(await fetchProfiles(groupData.members));
            } catch (err) {
                console.error("Błąd pobierania grupy: ", err);
                setError("Nie udało się pobrać grupy");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const isOwner = group?.owner_id === session.user.id;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink(group.invite_code));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setActionError("Nie udało się skopiować linku. Skopiuj go ręcznie");
        }
    };

    const runAction = async (action, errorMessages) => {
        setActionError("");
        setBusy(true);

        try {
            await action();
        } catch (err) {
            console.error("Błąd akcji w grupie: ", err);
            setActionError(errorMessages[err.message] || "Coś poszło nie tak. Spróbuj ponownie");
        } finally {
            setBusy(false);
        }
    };

    const handleRegenerate = () => runAction(async () => {
        const code = await regenerateInviteCode(group.id);
        setGroup({ ...group, invite_code: code });
    }, { not_group_owner: "Tylko właściciel może zmienić kod zaproszenia" });

    const handleLeave = () => {
        if (!window.confirm(`Czy na pewno chcesz opuścić grupę „${group.name}”?`)) return;

        runAction(async () => {
            await leaveGroup(group.id);
            navigate('/dashboard');
        }, {
            owner_cannot_leave: "Właściciel nie może opuścić grupy. Możesz ją usunąć",
            not_a_member: "Nie jesteś już członkiem tej grupy",
        });
    };

    const handleDelete = () => {
        if (!window.confirm(`Czy na pewno chcesz usunąć grupę „${group.name}”? Tej operacji nie można cofnąć.`)) return;

        runAction(async () => {
            await deleteGroup(group.id);
            navigate('/dashboard');
        }, {});
    };

    if (loading) {
        return <p className="text-center pt-24">Ładowanie..</p>;
    }

    return (
        <div className="max-w-md mx-auto pt-24 pb-12">
            <div className="border rounded-lg shadow-md p-6">
                <Link to="/dashboard" className="text-green-600 underline hover:text-green-800">
                    ← Wróć do panelu
                </Link>

                {error ? (
                    <p className="text-red-600 pt-4">{error}</p>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mt-4 mb-4">{group.name}</h1>

                        <h3 className="font-bold mb-2">Zaproś znajomych</h3>
                        <p className="text-gray-600 text-sm">Kod zaproszenia:</p>
                        <p className="font-mono text-xl tracking-widest">{group.invite_code}</p>
                        <p className="text-gray-600 text-sm mt-2 break-all">{inviteLink(group.invite_code)}</p>
                        <button
                            onClick={handleCopy}
                            className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 cursor-pointer">
                            {copied ? "Skopiowano!" : "Kopiuj link zaproszenia"}
                        </button>
                        {isOwner && (
                            <button
                                onClick={handleRegenerate}
                                disabled={busy}
                                className="mt-2 w-full border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 disabled:opacity-50 cursor-pointer">
                                Wygeneruj nowy kod
                            </button>
                        )}

                        <h3 className="font-bold mt-6 mb-2">Członkowie ({members.length})</h3>
                        <ul className="flex flex-col gap-1">
                            {members.map((member) => (
                                <li key={member.id} className="flex justify-between border-b py-1">
                                    <span>{member.display_name || member.email}</span>
                                    {member.id === group.owner_id && (
                                        <span className="text-sm text-gray-600">Właściciel</span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {isOwner ? (
                            <button
                                onClick={handleDelete}
                                disabled={busy}
                                className="mt-6 w-full border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 cursor-pointer">
                                Usuń grupę
                            </button>
                        ) : (
                            <button
                                onClick={handleLeave}
                                disabled={busy}
                                className="mt-6 w-full border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 cursor-pointer">
                                Opuść grupę
                            </button>
                        )}
                        {actionError && <p className="text-red-600 text-center pt-2">{actionError}</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default GroupPage
