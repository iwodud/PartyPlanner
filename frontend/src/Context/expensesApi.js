import { supabase } from './supabaseClient';

export const fetchExpenses = async (groupId) => {
    const { data, error } = await supabase
        .from('expenses_details')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createExpense = async ({ groupId, title, amount, paidBy, participants, weights }) => {
    const { data, error } = await supabase.rpc('create_expense', {
        p_group_id: groupId,
        p_title: title,
        p_amount: amount,
        p_paid_by: paidBy,
        p_participants: participants,
        p_weights: weights
    })
    if (error) throw error
    return data
}
