import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { getMe, updateMyEmail } from "../api/user";
import { useAuth } from "./AuthContext";


const UserContext = createContext(null);


export function UserProvider({ children }) {

    const [ lastUsername, setLastUsername ] = useState(() =>
        sessionStorage.getItem("lastUsername") || ""
    )

    const { statusLoggedIn } = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['user'],
        queryFn: getMe,
        enabled: statusLoggedIn === "loggedIn",
        staleTime: 1000 * 60 * 5,
        retry: false
    })

    const refreshUser = async () => await queryClient.invalidateQueries(['user']);
    const resetUser = () => queryClient.removeQueries(['user'])
    
    const {data: user, isError, isLoading} = query

    useEffect(() => {
        if (user?.username) {
            sessionStorage.setItem("lastUsername", user.username);
            setLastUsername(user.username);
        }
    }, [user])


    // Mutation for updating email
    const updateEmailMutation = useMutation({
        mutationFn: updateMyEmail,
        onSuccess: () => {
            queryClient.invalidateQueries(['user']);
        }
    });

    // Expose a function that wraps the mutation
    const updateEmail = async (email) => {
        try {
            const data = await updateEmailMutation.mutateAsync(email);
            return { success: true, data };
        } catch (err) {
            let message = err?.response?.data?.detail || err?.message || "Unknown error";
            return { success: false, message };
        }
    };

    const isAdmin = user?.is_admin ?? false;
    const isSuperAdmin = user?.role === "super_admin";

    return (
        <UserContext.Provider value={{
            user, refreshUser, resetUser, isError, isLoading, lastUsername, updateEmail,
            isAdmin, isSuperAdmin
        }}>
            { children }
        </UserContext.Provider>
    )
}

export function useUser() {
    return useContext(UserContext);
}