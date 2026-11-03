import { useEffect, useState } from 'react';
import { UserAuth } from '../Context/AuthContext'
import { Link, useNavigate } from "react-router"
import { createGroup, fetchMyGroups, joinErrorMessage, joinGroup } from '../Context/groupsApi';

const Dashboard = () => {
const {session, signOut} = UserAuth();
const navigate = useNavigate();

const [groups, setGroups] = useState([]);
const [groupsLoading, setGroupsLoading] = useState(true);
const [groupsError, setGroupsError] = useState("");

const [groupName, setGroupName] = useState("");
const [createError, setCreateError] = useState("");
const [creating, setCreating] = useState(false);

const [inviteCode, setInviteCode] = useState("");
const [joinError, setJoinError] = useState("");
const [joining, setJoining] = useState(false);

useEffect(() => {
    fetchMyGroups()
        .then(setGroups)
        .catch((error) => {
            console.error("Błąd pobierania grup: ", error);
            setGroupsError("Nie udało się pobrać listy grup");
        })
        .finally(() => setGroupsLoading(false));
}, []);

const handleSignOut = async (e) => {
    e.preventDefault();
    await signOut();
    navigate("/signin");

};

const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!groupName.trim()) {
        setCreateError("Podaj nazwę grupy");
        return;
    }

    if (groupName.trim().length > 50) {
        setCreateError("Nazwa grupy może mieć maksymalnie 50 znaków");
        return;
    }

    setCreating(true);

    try {
        const group = await createGroup(groupName, session.user.id);
        navigate(`/groups/${group.id}`);
    } catch (error) {
        console.error("Błąd tworzenia grupy: ", error);
        setCreateError("Nie udało się utworzyć grupy. Spróbuj ponownie");
    } finally {
        setCreating(false);
    }
};

const handleJoinGroup = async (e) => {
    e.preventDefault();
    setJoinError("");

    if (!inviteCode.trim()) {
        setJoinError("Podaj kod zaproszenia");
        return;
    }

    setJoining(true);

    try {
        const groupId = await joinGroup(inviteCode);
        navigate(`/groups/${groupId}`);
    } catch (error) {
        console.error("Błąd dołączania do grupy: ", error);
        setJoinError(joinErrorMessage(error));
    } finally {
        setJoining(false);
    }
};

    return (
        <div className="max-w-md mx-auto pt-24 pb-12">
            <div className="border rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-2">Panel główny</h1>
                <h2 className="text-gray-600">Witaj, {session?.user?.user_metadata?.display_name || session?.user?.email}!</h2>

                <h3 className="font-bold mt-6 mb-2">Moje grupy</h3>
                {groupsLoading && <p className="text-gray-600">Ładowanie..</p>}
                {groupsError && <p className="text-red-600">{groupsError}</p>}
                {!groupsLoading && !groupsError && groups.length === 0 && (
                    <p className="text-gray-600">Nie należysz jeszcze do żadnej grupy. Utwórz nową poniżej.</p>
                )}
                <ul className="flex flex-col gap-2">
                    {groups.map((group) => (
                        <li key={group.id}>
                            <Link
                                to={`/groups/${group.id}`}
                                className="block border rounded-lg p-3 hover:bg-gray-50">
                                <span className="font-semibold">{group.name}</span>
                                <span className="block text-sm text-gray-600">
                                    Członkowie: {group.members.length}
                                    {group.owner_id === session.user.id && " · Właściciel"}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <form onSubmit={handleCreateGroup} className="mt-6">
                    <h3 className="font-bold mb-2">Utwórz grupę</h3>
                    <input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Nazwa grupy"
                        className="p-3 w-full border rounded"
                        type="text">
                    </input>
                    <button
                        type="submit"
                        disabled={creating}
                        className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer">
                        Utwórz grupę
                    </button>
                    {createError && <p className="text-red-600 text-center pt-2">{createError}</p>}
                </form>

                <form onSubmit={handleJoinGroup} className="mt-6">
                    <h3 className="font-bold mb-2">Dołącz do grupy</h3>
                    <input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Kod zaproszenia"
                        className="p-3 w-full border rounded font-mono uppercase"
                        type="text">
                    </input>
                    <button
                        type="submit"
                        disabled={joining}
                        className="mt-3 w-full border border-green-600 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 disabled:opacity-50 cursor-pointer">
                        Dołącz
                    </button>
                    {joinError && <p className="text-red-600 text-center pt-2">{joinError}</p>}
                </form>

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
