import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Button, CircularProgress, Tab, Tabs, Typography } from "@mui/material";

import CustomModal from "../utils/CustomModal";
import { getGroupDetail } from "../../api/group";
import GroupMembersTab from "./GroupMembersTab";
import GroupPrinterPermitsTab from "./GroupPrinterPermitsTab";


function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}


export default function GroupDetailModal({ open, onClose, group, users, printers }) {
    const queryClient = useQueryClient();

    const [tab, setTab] = useState(0);

    const { data: detail, isLoading: detailLoading } = useQuery({
        queryKey: ["group-detail", group?.id],
        queryFn: () => getGroupDetail(group.id),
        enabled: open && Boolean(group?.id),
        staleTime: 0,
    });

    const refresh = () => queryClient.invalidateQueries(["group-detail", group?.id]);

    const memberCount = (detail?.members ?? []).length;
    const permitCount = (detail?.printer_permits ?? []).length;

    const content = detailLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
        </Box>
    ) : (
        <Box>
            {group?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {group.description}
                </Typography>
            )}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tab label={`Members (${memberCount})`} />
                <Tab label={`Printer Permits (${permitCount})`} />
            </Tabs>

            <TabPanel value={tab} index={0}>
                <GroupMembersTab group={group} users={users} detail={detail} refresh={refresh} />
            </TabPanel>

            <TabPanel value={tab} index={1}>
                <GroupPrinterPermitsTab group={group} printers={printers} detail={detail} refresh={refresh} />
            </TabPanel>
        </Box>
    );

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`Group: ${group?.name ?? ""}`}
            maxWidth="md"
            content={content}
            actions={<Button onClick={onClose}>Close</Button>}
        />
    );
}
