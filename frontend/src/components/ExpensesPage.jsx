import {Link, useParams } from 'react-router'
import { useState, useEffect } from 'react'
import { fetchGroup, fetchProfiles } from '../Context/groupsApi'
import { createExpense, fetchExpenses } from '../Context/expensesApi'


const formatPLN = (grosze) =>
    (grosze / 100).toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'})

const EXPENSE_ERRORS = {
    invalid_weight: "Każdy zaznaczony uczestnik musi mieć kwotę większą od zera.",
    participants_required: "Zaznacz co najmniej jednego uczestnika.",
    invalid_expense_data: "Sprawdź tytuł i kwotę wydatku.",
    not_a_group_member: "Nie jesteś członkiem tej grupy.",
    payer_not_in_group: "Osoba płacąca nie należy do grupy.",
    participant_not_in_group: "Jeden z uczestników nie należy do grupy."
}

const expensesToGrosze = (expense) => ({
                    ...expense,
                    amount: Math.round(Number(expense.amount) * 100)
                })

const ExpensesPage = () => {

    const { id } = useParams() 
    const [showForm, setShowForm] = useState(false)
    const [expenseTitle, setExpenseTitle] = useState("")
    const [expenseAmount, setExpenseAmount] = useState("")
    const [expensePaidBy, setExpensePaidBy] = useState("")
    const [selectedMembers, setSelectedMembers] = useState([])
    const [splitMode, setSplitMode] = useState("equal")
    const [manualSplit, setManualSplit] = useState({})
    const [error, setError] = useState("")
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState("")
    const [members, setMembers] = useState([])
    const [saving, setSaving] = useState(false)
    
    const toggleMember = (memberId) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(selectedMembers.filter((o) => o !== memberId))
        } else {
            setSelectedMembers([...selectedMembers, memberId])
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                const group = await fetchGroup(id)
                if (!group) {
                    setLoadError("Grupa nie istnieje albo nie jesteś jej członkiem")
                    return
                }
                const profiles = await fetchProfiles(group.members)
                setMembers(profiles)
                setSelectedMembers(profiles.map((profile) => profile.id))
                
                const expenses = await fetchExpenses(id)
                setOrders(expenses.map(expensesToGrosze))
            } catch (err) {
                console.error(err)
                setLoadError("Nie udało się pobrać danych grupy")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])
    const totalGrosze = Math.round(Number(expenseAmount) * 100)
    const base = selectedMembers.length > 0 ? Math.floor(totalGrosze / selectedMembers.length) : 0
    const remainder = selectedMembers.length > 0? totalGrosze % selectedMembers.length : 0

    const shareOf = (memberId) => {
        if (!selectedMembers.includes(memberId)) return 0
        if (splitMode === "manual") {
            return Math.round(Number(manualSplit[memberId] || 0) * 100)
        }
        const index = selectedMembers.indexOf(memberId)
        if (index === -1) return 0
        return index < remainder ? base + 1: base
    }

    const memberName = (memberId) => {
        const member = members.find((profile) => profile.id === memberId)
        if (!member) {
            return "—"
        }
        return member.display_name || member.email
    }

    const sharesSum = selectedMembers.reduce((sum, memberId) => sum + shareOf(memberId), 0)

    const updateMemberShare = (memberId, value) => {
        setManualSplit({...manualSplit, [memberId]: value})
    }

    const showShare = (share) => {
        if (!selectedMembers.includes(share.id)) {
            return <span className="text-gray-600"> - </span>
        }

        if (splitMode === "equal") {
            return <span> {formatPLN(shareOf(share.id))} </span>
        }
        return (
            <input
            type="number"
            step="0.01"
            min="0"
            value={manualSplit[share.id] || ""}
            onChange={(e) => updateMemberShare(share.id, e.target.value)}
            className="w-24 p-1 border rounded text-right"
            />
        )
    }

    const handleAddOrder = async (e) => {
        e.preventDefault()
        setError("")

        if (!expenseTitle.trim()) {
            setError("Podaj tytuł wydatku")
            return
        }

        if (totalGrosze <= 0) {
            setError("Kwota musi być większa od zera")
            return
        }

        if(!expensePaidBy) {
            setError("Wybierz, kto płacił")
            return
        }

        if(selectedMembers.length === 0) {
            setError("Zaznacz co najmniej jednego uczestnika")
            return
        }

        if (splitMode === "manual" && selectedMembers.some((memberId) => shareOf(memberId) <= 0)) {
            setError("Każdy zaznaczony uczestnik musi mieć kwotę większą od zera. Odznacz osoby, które nic nie płacą." )
            return
        }

        if (sharesSum !== totalGrosze) {
            setError("Podzielona kwota musi być równa kwocie wydatku")
            return
        }

        const weights = splitMode === "manual" ? selectedMembers.map((memberId) => shareOf(memberId) / 100) : null 

        setSaving(true)
        try{
           await createExpense ({groupId: id, title: expenseTitle, amount: totalGrosze / 100, paidBy: expensePaidBy, participants: selectedMembers, weights: weights})
           const expenses = await fetchExpenses(id)
           setOrders(expenses.map(expensesToGrosze))

           setExpenseTitle("")
           setExpenseAmount("")
           setExpensePaidBy("")
           setSplitMode("equal")
           setManualSplit({})
           setSelectedMembers(members.map((member) => member.id))
           setShowForm(false)

        } catch(err) {
            console.error(err)
            setError(EXPENSE_ERRORS[err.message] ||  "Nie udało się zapisać wydatku. Spróbuj ponownie.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <p className="text-center pt-24">Ładowanie...</p>
    }

    if (loadError) {
        return (
            <div className="max-w-md mx-auto pt-24">
                <div className="border rounded-lg shadow-md p-6">
                <p className="text-red-600">{loadError}</p>
                <Link 
                    to="/dashboard" 
                    className="text-green-600 underline hover:text-green-800 block mt-4">
                 ← Wróć do panelu
                </Link>
                </div>
            </div>
        )
    }
  return (
    <div className="max-w-md mx-auto pt-24">
      <div className="border rounded-lg shadow-md p-6">
        <Link to={`/groups/${id}`}className="text-green-600 underline hover:text-green-800 mt-4">
                    ← Wróć do grupy
                </Link>
        <h1 className="text-2xl font-bold mt-4">Wydatki</h1>
        {orders.length === 0 && (
            <p className="text-gray-600 mt-4">Brak wydatków. Dodaj pierwszy poniżej.</p>
        )}
        <ul className="flex flex-col gap-1 mt-4">
            {orders.map((order) => (
                <li key={order.id} className="flex justify-between border-b py-1">
                    <div>
                        <div>{order.title}</div>
                        <div className="text-sm text-gray-600">
                            zapłacił(a): {memberName(order.paid_by)}
                        </div>
                    </div>
                    <span>{formatPLN(order.amount)}</span>
                </li>
            ))}
        </ul>

        <button onClick = {() => setShowForm(!showForm)} className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 cursor-pointer" >
            {showForm ? "Anuluj" : "Dodaj wydatek"}
        </button>

        {showForm && (
            <form onSubmit={handleAddOrder} className="border rounded-lg p-4 mt-4">
                <h3 className="font-bold">Dodaj wydatek</h3>
                <label className="block text-sm text-gray-600 mt-3">Tytuł</label>
                <input
                        value={expenseTitle}
                        onChange={(e) => setExpenseTitle(e.target.value)}
                        className='p-3 mt-1 border rounded w-full'
                        type='text'
                        placeholder="np. Piwo">
                </input>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm text-gray-600 mt-3">Kwota (zł)</label>
                        <input
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            className='p-3 mt-1 border rounded w-full'
                            type="number"
                            step="0.01"
                            min="0">
                        </input>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mt-3">Kto płacił</label>
                        <select 
                            className="p-3 mt-1 w-full border rounded"
                            value={expensePaidBy}
                            onChange={(e) => setExpensePaidBy(e.target.value)}
                        >
                            <option value="">Wybierz płacącego</option>
                            {members.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {memberName(item.id)}
                                </option>
                        ))}
                    </select>
                    </div>
                </div>
                <div className='flex gap-2 mt-3'>
                    <button
                        type="button"
                        onClick={() => setSplitMode("equal")}
                        className={splitMode === "equal" ? "bg-green-600 text-white px-3 py-1 rounded" : "border px-3 py-1 rounded"}
                    >
                        Równo
                    </button>  

                    <button
                        type="button"
                        onClick={() => setSplitMode("manual")}
                        className={splitMode === "manual" ? "bg-green-600 text-white px-3 py-1 rounded" : "border px-3 py-1 rounded"}
                    >
                        Ręcznie
                    </button>  
                </div>

                <label className="block text-sm text-gray-600 mt-3">Uczestnicy</label>
                <div>
                    {members.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-1">
                            <label className="flex items-center gap-2">
                            <input 
                                type = "checkbox"
                                checked = {selectedMembers.includes(item.id)}
                                onChange = {() => toggleMember(item.id)}
                                />
                                {memberName(item.id)}
                            </label>
                            {showShare(item)}
                        </div>
                    ))}
                    <p className="text-sm text-gray-600 mt-2">
                        Podzielono: {formatPLN(sharesSum)} z {formatPLN(totalGrosze)}
                    </p>
                </div>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                <button
                    type="submit"
                    className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 cursor-pointer "
                    disabled={saving}
                >
                    {saving ? "Zapisywanie..." : "Dodaj"}.
                </button>
            </form>
        )}

      </div>
    </div>
  )
}

export default ExpensesPage