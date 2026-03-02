import { 
    Box, Button, Typography, Paper, List, ListItem, ListItemText, 
    CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePrinter } from "../../../context/PrinterContext";
import { useFile } from "../../../context/FileContext";
import { usePrint } from "../../../context/PrintContext";
import { useUser } from "../../../context/UserContext";

import { print } from "../../../api/print";
import { calculateTotalCost, countPagesInRange } from "../../printCoreFunctions/calculateCost";

import LoadingTypography from '../../utils/LoadingTypography'
import LoadingList from "../../utils/LoadingList";
import CustomModal from "../../utils/CustomModal";
import { useSnackbar } from "notistack";


export default function StepSend({ onPrev }) {

    const { user, isLoading: isLoadingUser } = useUser()
    const { selectedPrinter } = usePrinter();
    const { selectedIds, files, isLoading: isLoadingFiles } = useFile();
    const { printerOptionsByFile } = usePrint();
    const { enqueueSnackbar } = useSnackbar();

    const [ selectedFiles, setSelectedFiles ] = useState([]);
    const [ totalCost, setTotalCost ] = useState(0);
    const [ isPrinting, setIsPrinting ] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        setSelectedFiles(files?.filter(f => selectedIds.includes(f.id)) || [])
        const value = calculateTotalCost(
            files?.filter(f => selectedIds.includes(f.id)) || [],
            printerOptionsByFile, 
            selectedPrinter
        )
        setTotalCost(value);
    }, [files])

    const handleBack = () => {
        onPrev?.();
    }

    const handlePrint = async () => {
        setIsPrinting(true);

        const printStatus = {};

        for (let i = 0; i < selectedIds.length; i++) {
            const id = selectedIds[i];
            printStatus[id] = {
                status: false,
                message: ""
            }

            try {
                const response = await print(selectedPrinter.name, id, printerOptionsByFile[id]);
                printStatus[id].status = true;

            } catch (err) {
                printStatus[id].message = err.message
            }

        }
        
        const filesMap = Object.fromEntries(selectedFiles.map(obj => [obj.id, obj]));
        setTimeout(() => {
            setIsPrinting(false);

            for (const key in printStatus) {
                const status = printStatus[key].status;
                if (status) {
                    enqueueSnackbar(`File ${filesMap[key].filename} queued`, { variant: "success" })
                } else {
                    enqueueSnackbar(`Could not print ${filesMap[key].filename}. Try again later.`, { variant: "error" })
                }
            }
            
            navigate("/");
        }, 800);
    }

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="h6">
                Summary
            </Typography>

            <Box sx={{ 
                display: "flex", 
                flexDirection: "row", 
                justifyContent: "center",
                alignItems: "center",
                gap: 1.5
            }}>
                <PrintIcon fontSize="large"/>
                <Box >
                    <Typography variant="body1">
                        {selectedPrinter?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {selectedPrinter?.location}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ p: 1 }}>
                <Typography variant="body1">FILES TO PRINT:</Typography>
                {isLoadingFiles ? (
                    <LoadingList count={selectedIds.length} sx={{ overflowY: "auto", maxHeight: "calc(60vh - 250px)", }}/>
                ) : selectedFiles.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No files selected</Typography>
                ) : (
                    <List sx={{ overflowY: "auto", maxHeight: "calc(60vh - 250px)", }} >
                        {selectedFiles.map(file => {
                            const opts = printerOptionsByFile[file.id];
                            const pagesCount = countPagesInRange(opts?.pageRanges, file.pages) * (opts?.copies || 1);
                            return (
                                <ListItem key={file.id} divider disablePadding>
                                    <ListItemText
                                        primary={file.filename}
                                        secondary={`Pages to print: ${pagesCount}`}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Box>

            {/* Costo total */}
            <Paper sx={{ p: 1.5, display: "flex", flexDirection:"column", alignItems: "center" }}>
                <LoadingTypography
                    color="text.secondary"
                    variant="body2" 
                    loadingWidth={150} 
                    isLoading={isLoadingUser}
                >
                    Current balance: €{user?.balance.toFixed(2)}
                </LoadingTypography>

                <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                    <Typography 
                        variant="h6"
                    >
                        Total cost 
                    </Typography>
                            
                    <LoadingTypography 
                        variant="h6" 
                        color={user?.balance + user?.credit_limit >= totalCost ? "primary" : "error"} 
                        sx={{ fontWeight: "bold" }}
                        loadingWidth={50}
                        isLoading={isLoadingFiles}
                    >
                        €{totalCost.toFixed(2)}
                    </LoadingTypography>
            </Box>

                {(user?.balance + user?.credit_limit < totalCost) && (
                    <Typography variant="body2" color="error">
                        Insufficient credit!
                    </Typography>
                )}   
            </Paper>

            <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
                <Button 
                    variant="outlined" 
                    onClick={handleBack} 
                    endIcon={<ArrowBackIcon />} 
                >
                    Back
                </Button>

                <Button 
                    variant="contained" 
                    onClick={handlePrint} 
                    startIcon={<PrintIcon />} 
                    disabled={user?.balance + user?.credit_limit < totalCost}
                >
                    Print
                </Button>
            </Box>

            <CustomModal
                open={isPrinting}
                onClose={() => {}}
                title=""
                content={
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 2 }}>
                        <CircularProgress />
                        <Typography variant="body1">Printing, please wait...</Typography>
                    </Box>
                }
                actions={<></>} // Sin botones, bloquea hasta que termine la impresión
                maxWidth="xs"
            />
        </Box>
    )
}