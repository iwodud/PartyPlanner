import { createContext, useEffect, useState, useContext } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
    const [session, setSession]= useState(undefined);

    //Rejestracja

    const signUpNewUser = async (email, password) => {
        const { data, error }= await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            console.error("Coś poszło nie tak podczas rejestracji:", error);
            return { success: false, error };
        }
        return {success: true, data}
    };

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session} }) => {
            setSession(session);
        });


        const {data} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => data.subscription.unsubscribe()

    }, []);


    //Logowanie
    const signInUser = async(email, password) => {
        try {
            const { data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error("Wystąpił problem podczas logowania: ", error);
                return {success: false, error};
            }

            return { success: true, data}

        } catch (error) {
            console.error("Coś poszło nie tak. Spróbuj ponownie", error);
            return { success: false, error}
        }
    };


    // Wyloguj się
    const signOut = async() => {
        const { error } = await supabase.auth.signOut();

        if(error) {
            console.error("Błąd: ", error)
        }
    };

    return (
        <AuthContext.Provider value={{session, signUpNewUser, signInUser, signOut}}>
            {children}
        </AuthContext.Provider>
    );

};

export const UserAuth = () => {
    return useContext(AuthContext);
};