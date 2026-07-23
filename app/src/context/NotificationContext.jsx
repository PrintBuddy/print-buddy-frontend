import { SnackbarProvider, closeSnackbar } from "notistack";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


export function NotifProvider({ children }) {
    return (
        <SnackbarProvider
            maxSnack={5}                       // Máximo número de snackbars visibles
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            autoHideDuration={4000}            // Duración automática
            hideIconVariant={false}            // Muestra icono según tipo
            action={(key) => (
                <IconButton
                    size="small"
                    aria-label="Close notification"
                    onClick={() => closeSnackbar(key)}
                    sx={{ color: "inherit" }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            )}
        >
            { children }
        </SnackbarProvider>
    );
}