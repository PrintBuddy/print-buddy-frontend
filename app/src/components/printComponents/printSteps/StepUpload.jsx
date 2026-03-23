import { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Chip,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { useFile } from '../../../context/FileContext'
import { useSnackbar } from 'notistack';

import LoadingList from '../../utils/LoadingList';



export default function StepUpload({ onNext }) {
    const { 
        files, isLoading, selectedIds,
        toggleFile, uploadLocalFile 
    } = useFile();

    const [ isFetching, setIsFetching ] = useState(false);
    const [ isDragActive, setIsDragActive ] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const sortedFiles = useMemo(() => {
        return [...(files || [])].sort((a, b) => 
        new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
    }, [files]);

    const uploadFiles = async (fileList) => {
        setIsFetching(true)

        if (!fileList) {
            setIsFetching(false)
            return
        };

        for (let i = 0; i < fileList.length; i++) {
            try {
                await uploadLocalFile(fileList[i]);
            } catch (error) {
                const msg = error.message || "Error uploading file";
                enqueueSnackbar(msg, { variant: "error" });
            }
        }

        setIsFetching(false)
    }

    const handleUpload = async (e) => {
        await uploadFiles(e.target.files);
        e.target.value = "";
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragActive(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragActive(false);
        }
    }

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragActive(false);
        await uploadFiles(e.dataTransfer?.files);
    }

    const handleNext = () => {
        if (selectedIds.length == 0) return ;
        onNext?.();
    }

    const selectedFiles = sortedFiles.filter((file) => selectedIds.includes(file.id));
    const selectedPages = selectedFiles.reduce((sum, file) => sum + (file.pages || 0), 0);


    return (
        <Box
            sx={{
                width: "100%",
                height: { xs: "calc(100dvh - 320px)", sm: "calc(100dvh - 360px)" },
                maxHeight: { xs: "calc(100dvh - 320px)", sm: "calc(100dvh - 360px)" },
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Stack spacing={1.25} sx={{ flexShrink: 0 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={0.75}
                >
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Choose your files
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Upload or choose the files to print.
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip
                            label={`${selectedIds.length} selected`}
                            color={selectedIds.length > 0 ? "primary" : "default"}
                            sx={{ borderRadius: 999, fontWeight: 600 }}
                        />
                        <Chip
                            variant="outlined"
                            label={`${selectedPages} page${selectedPages === 1 ? "" : "s"}`}
                            sx={{ borderRadius: 999 }}
                        />
                    </Stack>
                </Stack>

            </Stack>

            <Box
                sx={{
                    mt: 1.25,
                    mb: 1.25,
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    borderRadius: 3,
                    border: "1px dashed",
                    borderColor: isDragActive ? "primary.main" : "transparent",
                    backgroundColor: isDragActive ? "rgba(25,118,210,0.06)" : "transparent",
                    transition: "border-color 0.18s ease, background-color 0.18s ease",
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
            {(isLoading || isFetching) ? (
                <LoadingList /> 
            ) : (!files || files?.length == 0) ? (
                <Paper
                    elevation={0}
                    sx={{
                        height: "100%",
                        p: 3,
                        borderRadius: 3,
                        textAlign: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "rgba(15, 23, 42, 0.02)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <DescriptionOutlinedIcon sx={{ fontSize: 34, color: "text.secondary", mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        No files uploaded yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Drag files here or use Upload.
                    </Typography>
                </Paper>
            ) : (
                <List sx={{ display: "flex", flexDirection: "column", gap: 1.25, p: 0.5 }}>
                    {sortedFiles?.map(f => (
                        <ListItem key={f.id} disablePadding sx={{ display: "block" }}>
                            <ListItemButton 
                                selected={selectedIds.includes(f.id)} 
                                onClick={() => toggleFile(f.id)}
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: selectedIds.includes(f.id) ? "primary.main" : "divider",
                                    backgroundColor: selectedIds.includes(f.id) ? "rgba(25,118,210,0.06)" : "background.paper",
                                    alignItems: "flex-start",
                                    transition: "all 0.18s ease",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        backgroundColor: "rgba(25,118,210,0.05)",
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            display: "grid",
                                            placeItems: "center",
                                            borderRadius: 2.5,
                                            backgroundColor: "rgba(15,23,42,0.06)",
                                        }}
                                    >
                                        <InsertDriveFileIcon />
                                    </Box>
                                </ListItemIcon>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight={700} noWrap>
                                                {f.filename}
                                            </Typography>
                                        }
                                        secondary={
                                            <Stack
                                                direction="row"
                                                spacing={0.75}
                                                useFlexGap
                                                flexWrap="nowrap"
                                                sx={{ mt: 0.75, minWidth: 0 }}
                                            >
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label={`${f.pages} page${f.pages === 1 ? "" : "s"}`}
                                                    sx={{
                                                        borderRadius: 999,
                                                        maxWidth: "48%",
                                                        "& .MuiChip-label": {
                                                            px: 1,
                                                            fontSize: "0.72rem",
                                                            whiteSpace: "nowrap",
                                                        },
                                                    }}
                                                />
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label={`${Math.round(f.size_bytes / 1024)} KB`}
                                                    sx={{
                                                        borderRadius: 999,
                                                        maxWidth: "48%",
                                                        "& .MuiChip-label": {
                                                            px: 1,
                                                            fontSize: "0.72rem",
                                                            whiteSpace: "nowrap",
                                                        },
                                                    }}
                                                />
                                            </Stack>
                                        }
                                    />
                                </Box>

                                {selectedIds.includes(f.id) && (
                                    <CheckCircleIcon color="primary" sx={{ ml: 1 }} />
                                )}
                            </ListItemButton>
                        </ListItem>
                        
                    ))}
                </List>
            )}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                    pt: 0.25,
                    flexShrink: 0,
                }}
            >
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<UploadFileIcon />}
                    component="label"
                    sx={{ borderRadius: 999, px: 2.25, py: 0.75 }}
                >
                    Upload
                    <input
                        hidden
                        type="file"
                        multiple
                        onChange={handleUpload}
                    />
                </Button>

                <Button 
                    variant="contained" 
                    onClick={handleNext} 
                    disabled={selectedIds.length == 0}
                    endIcon={<ArrowForwardIcon />} 
                    sx={{ borderRadius: 999, px: 3 }}
                >
                    Next
                </Button>
            </Box>
        </Box>
    )
}
