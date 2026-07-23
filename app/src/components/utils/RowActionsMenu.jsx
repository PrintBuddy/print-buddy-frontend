import { useState } from "react";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Compact "⋮" overflow menu for table rows that expose several actions —
// meant for mobile's collapsed 2-column layout, where a row of icon
// buttons (as used on desktop) wouldn't fit.
export default function RowActionsMenu({ actions }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const visibleActions = actions.filter((a) => a.hidden !== true);

    const handleOpen = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };
    const handleClose = () => setAnchorEl(null);

    if (!visibleActions.length) return null;

    return (
        <>
            <IconButton size="small" onClick={handleOpen} aria-label="More actions">
                <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {visibleActions.map((action) => (
                    <MenuItem
                        key={action.label}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                            action.onClick();
                        }}
                        sx={action.color ? { color: `${action.color}.main` } : undefined}
                    >
                        <ListItemIcon sx={action.color ? { color: `${action.color}.main` } : undefined}>
                            {action.icon}
                        </ListItemIcon>
                        <ListItemText>{action.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
