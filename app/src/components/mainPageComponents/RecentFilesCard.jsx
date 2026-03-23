import { Box, Button, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LoadingList from "../utils/LoadingList";
import UserSurface from "../userViewComponents/UserSurface";

export default function RecentFilesCard({ files, isLoading, onViewAll }) {
    return (
        <UserSurface
            title="Recent Files"
            description="Recently uploaded documents ready to print again."
            sx={{ height: "100%" }}
        >
        <Button
            variant="text"
            size="small"
            endIcon={<InsertDriveFileIcon />}
            sx={{ alignSelf: "flex-end", mt: -1 }}
            onClick={onViewAll}
        >
            View all
        </Button>

        <Box
            sx={{
            mt: 1,
            maxHeight: "calc(80vh - 200px)",
            overflowY: "auto",
            marginBottom: 1,
            }}
        >
            {isLoading ? (
                <LoadingList />
                ) : (!files || files.length === 0) ? (
                <List>
                    <ListItem>
                    <ListItemText primary="No files uploaded yet." />
                    </ListItem>
                </List>
                ) : (
                <List>
                    {files.map((f) => (
                    <ListItem key={f.id} disablePadding>
                        <ListItemIcon>
                        <InsertDriveFileIcon />
                        </ListItemIcon>

                        <ListItemText
                        primary={f.filename}
                        secondary={`Pages: ${f.pages || "-"}, Size: ${f.size_bytes ? Math.round(f.size_bytes / 1024) : "-"} KB`}
                        sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}

                        />

                    </ListItem>
                    ))}
                </List>
            )}
        </Box>
        </UserSurface>
    );
}
