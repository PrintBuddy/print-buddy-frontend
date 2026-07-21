import { useState } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Chip,
    List,
    ListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useRechargeRequests } from "../../context/RechargeRequestContext";
import AdminPaymentInfoModal from "./AdminPaymentInfoModal";


export default function MoneyInfoAccordion() {
    const { eligibleAdmins, adminsLoading } = useRechargeRequests();
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    return (
        <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">How to recharge my balance?</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Pay one of the admins below in cash (everyone accepts cash — some also accept
                    bank transfer), then let us know from the section below.
                </Typography>

                {adminsLoading ? (
                    <Typography color="text.secondary">Loading admins…</Typography>
                ) : !eligibleAdmins?.length ? (
                    <Typography variant="body2" color="text.secondary">
                        No admins configured yet.
                    </Typography>
                ) : (
                    <List disablePadding>
                        {eligibleAdmins.map((admin) => (
                            <ListItemButton
                                key={admin.telegram_admin_id}
                                onClick={() => setSelectedAdmin(admin)}
                                sx={{ borderRadius: 2, mb: 0.5 }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography variant="body1">{admin.name} {admin.surname}</Typography>
                                            {admin.accepts_transfer ? (
                                                <Chip label="Transfer" size="small" color="primary" variant="outlined" />
                                            ) : (
                                                <Chip label="Cash" size="small" variant="outlined" />
                                            )}
                                        </Box>
                                    }
                                    secondary={`@${admin.username}`}
                                />
                                <ChevronRightIcon color="action" fontSize="small" />
                            </ListItemButton>
                        ))}
                    </List>
                )}
            </AccordionDetails>

            <AdminPaymentInfoModal
                admin={selectedAdmin}
                open={Boolean(selectedAdmin)}
                onClose={() => setSelectedAdmin(null)}
            />
        </Accordion>
    );
}
