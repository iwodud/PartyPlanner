import { supabase } from './supabaseClient';

// RLS zwraca tylko grupy, w których zalogowany użytkownik jest członkiem
export const fetchMyGroups = async () => {
    const { data, error } = await supabase
        .from('groups')
        .select('id, name, owner_id, members, created_at')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const fetchGroup = async (groupId) => {
    const { data, error } = await supabase
        .from('groups')
        .select('id, name, owner_id, members, invite_code, created_at')
        .eq('id', groupId)
        .maybeSingle();

    if (error) throw error;
    return data;
};

export const fetchProfiles = async (userIds) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', userIds);

    if (error) throw error;
    return data;
};

// Trigger w bazie sam dopisuje właściciela do members
export const createGroup = async (name, ownerId) => {
    const { data, error } = await supabase
        .from('groups')
        .insert({ name: name.trim(), owner_id: ownerId })
        .select('id')
        .single();

    if (error) throw error;
    return data;
};

export const deleteGroup = async (groupId) => {
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) throw error;
};

// Funkcje RPC zwracają kod błędu w error.message (np. 'invalid_invite_code')
export const joinGroup = async (code) => {
    const { data, error } = await supabase.rpc('join_group', { p_code: code });
    if (error) throw error;
    return data;
};

export const leaveGroup = async (groupId) => {
    const { error } = await supabase.rpc('leave_group', { p_group_id: groupId });
    if (error) throw error;
};

export const regenerateInviteCode = async (groupId) => {
    const { data, error } = await supabase.rpc('regenerate_invite_code', { p_group_id: groupId });
    if (error) throw error;
    return data;
};

export const inviteLink = (code) => `${window.location.origin}/join/${code}`;
