import { Box, Chip, Divider, Link, Stack, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

export default function AdminPaymentInfoModal({ admin, open, onClose }) {
    if (!admin) return null;

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`${admin.name} ${admin.surname}`}
            maxWidth="xs"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">@{admin.username}</Typography>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            💵 Cash
                        </Typography>
                        <Typography variant="body2">
                            {admin.phone_number ?? "Contact them directly to arrange payment."}
                        </Typography>
                    </Box>

                    {admin.accepts_transfer && (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    🏦 Bank transfer
                                </Typography>
                                <Stack spacing={0.5}>
                                    {admin.bank_name && <Typography variant="body2">Name: {admin.bank_name}</Typography>}
                                    {admin.bank_iban && <Typography variant="body2">IBAN: {admin.bank_iban}</Typography>}
                                    {admin.bank_link && (
                                        <Typography variant="body2">
                                            Link: <Link href={admin.bank_link} target="_blank" rel="noopener noreferrer">{admin.bank_link}</Link>
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        </>
                    )}

                    {!admin.accepts_transfer && (
                        <Chip label="Cash only" size="small" variant="outlined" sx={{ alignSelf: "flex-start" }} />
                    )}
                </Stack>
            }
        />
    );
}
