import { Button, Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Stack } from "@mui/material";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from '@mui/icons-material/Delete';

import { usePrint } from "../context/PrintContext";
import { useFile } from "../context/FileContext";
import LoadingList from "../components/utils/LoadingList";
import { useState, useMemo } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import UserPageHero from "../components/userViewComponents/UserPageHero";
import UserSurface from "../components/userViewComponents/UserSurface";



export default function FilePage() {

    const { 
        files, isLoading, deleteFileFromWeb, 
        refreshFiles, setSelectedIds: setGlobalIds
    } = useFile();

    const { enqueueSnackbar } = useSnackbar();
    const { setActivePrintStep } = usePrint();
    const navigate = useNavigate();

    const [ selectedIds, setSelectedIds ] = useState([]);

    const sortedFiles = useMemo(() => {
        return [...(files || [])].sort((a, b) => 
        new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
    }, [files]);
    
    const toggleFile = (id) => {
        setSelectedIds(prev => {
            const next = prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id];
            return next;
        });
    };

    const handleDeleteFile = async (fileId, filename) => {
        try {
            const success = await deleteFileFromWeb(fileId);
            enqueueSnackbar(`File ${filename} deleted.`, { variant: "success" })
        } catch {
            enqueueSnackbar(`Error while deleting ${filename}.`, { variant: "error" })
        }
    }

    const handleDelete = async () => {
        const selectedFiles = files?.filter(f => selectedIds.includes(f.id)) || []

        for (let i = 0; i < selectedFiles.length; i++) {
            const id = selectedFiles[i].id;
            const name = selectedFiles[i].filename;
            await handleDeleteFile(id, name);
        }

        await refreshFiles();
        setSelectedIds([])
    }

    const handlePrint = () => {
        setGlobalIds(selectedIds);
        setActivePrintStep(1);
        setSelectedIds([])
        navigate("/print")
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <UserPageHero
                title="My Files"
                description="Review uploaded files, select multiple documents, and send them straight back to print."
            />

            <UserSurface title="Uploaded Files" description="Tap a file to select it, then print or remove your selection.">
                <Box
                    sx={{
                        maxHeight: "calc(80vh - 200px)",
                        overflowY: "auto",
                        marginBottom: 1
                    }}
                >
                    {isLoading ? (
                        <LoadingList />
                    ) : (!files || files?.length == 0) ? (
                        <List>
                            <ListItem>
                                <ListItemText primary="No files uploaded yet." />
                            </ListItem>
                        </List>
                    ) : (
                        <List>
                            {sortedFiles?.map(f => (
                                <ListItem key={f.id} disablePadding>
                                    <ListItemButton
                                        selected={selectedIds.includes(f.id)}
                                        onClick={() => toggleFile(f.id)}
                                    >
                                        <ListItemIcon>
                                            <InsertDriveFileIcon />
                                        </ListItemIcon>

                                        <ListItemText 
                                            primary={f.filename}
                                            secondary={`Pages: ${f.pages}, Size: ${Math.round(f.size_bytes / 1024)} KB`}
                                        />

                                        {selectedIds.includes(f.id) && (
                                            <CheckCircleIcon 
                                                color="primary" 
                                                sx={{ position: "absolute", right: 30 }} 
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="flex-end"
                    sx={{ width: "100%" }}
                >
                    <Button
                        variant="contained"
                        color="error"
                        disabled={selectedIds.length === 0}
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                        Delete
                    </Button>
                    <Button
                        variant="contained"
                        disabled={selectedIds.length === 0}
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                        Print
                    </Button>
                </Stack>
            </UserSurface>
        </Box>
    )
}
