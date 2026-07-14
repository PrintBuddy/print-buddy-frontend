import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export default function ConfirmDeleteUserDialog({ user, onClose, onConfirm }) {
    return (
        <Dialog
            open={Boolean(user)}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>Delete user?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to permanently delete{" "}
                    <strong>{user?.username}</strong>? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button color="error" variant="contained" onClick={onConfirm}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
