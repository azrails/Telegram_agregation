import Sheet from "@mui/joy/Sheet";
import GlobalStyles from "@mui/joy/GlobalStyles";
import IconButton from "@mui/joy/IconButton";
import { closeSidebar } from "../../../utils";
import List from "@mui/joy/List"
import ListItem from "@mui/joy/ListItem"
import ListItemButton from "@mui/joy/ListItemButton"
import { Link, useLocation } from "react-router-dom"
import { ColoredSchemeToggleMenu } from "../ColoredSchemeToggle";

export default function SideBar() {
    const path = useLocation().pathname;
    return <Sheet
        color="primary"
        invertedColors
        sx={{
            position: {
                xs: 'fixed',
                md: 'sticky',
            },
            transform: {
                xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
                md: 'none',
            },
            transition: 'transform 0.4s',
            zIndex: 10000,
            height: '100vh',
            width: 'var(--FirstSidebar-width)',
            top: 0,
            p: 1.5,
            py: 2,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            borderRight: '1px solid',
            borderColor: 'divider',
        }}
    >
        <GlobalStyles styles={{
            ':root': {
                '--FirstSidebar-width': '68px',
            },
        }} />
        <IconButton
            variant="soft"
            color="neutral"
            onClick={() => closeSidebar()}
            sx={{ display: { md: 'none' }, mt: -1, borderRadius: '50%' }}
        >
            <i data-feather="arrow-left" />
        </IconButton>
        <List sx={{ "--ListItem-radius": '8px', "--List-gap": '12px' }}>
            <ListItem>
                {path == "/" ? 
                <ListItemButton selected onClick={() => closeSidebar()}>
                    <Link to="/">
                        <i data-feather="home" />
                    </Link>
                </ListItemButton> : <ListItemButton  onClick={() => closeSidebar()}>
                    <Link to="/">
                        <i data-feather="home" />
                    </Link>
                </ListItemButton>}
            </ListItem>
            <ListItem>
                <ListItemButton>
                    <i data-feather="clipboard" />
                </ListItemButton>
            </ListItem>
            <ListItem>
                <ListItemButton>
                    <i data-feather="file-plus" />
                </ListItemButton>
            </ListItem>
        </List>
        <List sx={{ mt: 'auto', flexGrow: 0, "--ListItem-radius": '8px', "--List-gap": '12px' }}>
            <ColoredSchemeToggleMenu sx={{ display: { xs: 'none', md: 'inline-flex' } }} />
            <ListItem>
                <ListItemButton>
                    <i data-feather="settings" />
                </ListItemButton>
            </ListItem>
        </List>
    </Sheet>
}