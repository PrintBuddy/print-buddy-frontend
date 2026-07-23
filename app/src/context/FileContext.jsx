import { createContext, useContext, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";


import { getFiles, uploadFile, deleteFile } from "../api/file";
import { useAuth } from "./AuthContext";


const FileContext = createContext(null);

export function FileProvider({ children }){
    const { statusLoggedIn } = useAuth();

    const queryFiles = useQuery({
        queryKey: ['files'],
        queryFn: getFiles,
        enabled: statusLoggedIn === "loggedIn",
        staleTime: 1000 * 60 * 5,
        retry: false
    })

    const { data: files, isLoading, isError, isFetching } = queryFiles;

    const [selectedIds, setSelectedIds] = useState(() => {
        const saved = sessionStorage.getItem("selectedIds");
        return saved ? JSON.parse(saved) : [];
    });

    const toggleFile = (id) => {
        setSelectedIds(prev => {
            const next = prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id];

                sessionStorage.setItem("selectedIds", JSON.stringify(next));
            return next;
        });
    };

    const queryClient = useQueryClient();
    const refreshFiles = async () => await queryClient.invalidateQueries(['files']);

    const uploadFileMutation = useMutation({
        mutationFn: uploadFile,
        onSuccess: async () => {
            // Refrescar lista de archivos de la DB
            await queryClient.invalidateQueries(['files']);
        }
    });

    const deleteFileMutation = useMutation({
        mutationFn: deleteFile,
        onSuccess: async () => {
            await queryClient.invalidateQueries(['files']);
        }
    })

    const uploadLocalFile = async (file) => {
        await uploadFileMutation.mutateAsync(file)
    }

    const deleteFileFromWeb = async (fileId) => {
        await deleteFileMutation.mutateAsync(fileId)
    }

    const resetState = () => {
        setSelectedIds([]);
        sessionStorage.removeItem("selectedIds")
    }


    return (
        <FileContext.Provider value={{
            files, isLoading, isError, isFetching, selectedIds,
            setSelectedIds,
            toggleFile, uploadLocalFile, resetState, deleteFileFromWeb,
            refreshFiles
        }} >
            { children }
        </FileContext.Provider>
    )
}

export function useFile() {
    return useContext(FileContext);
}