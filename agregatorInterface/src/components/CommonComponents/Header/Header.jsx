import Sheet from "@mui/joy/Sheet"
import GlobalStyles from "@mui/joy/GlobalStyles"
import ColoredSchemeToggle from "../ColoredSchemeToggle"
import IconButton from "@mui/joy/IconButton"
import { toggleSidebar } from "../../../utils"

export default function Header() {
    return <Sheet sx={{
        display: { xs: "flex", md: "none" },
        alignItems: "center",
        position: "fixed",
        top: 0,
        width: '100vw',
        height: 'var(--Header-height)',
        zIndex: 9995,
        py: 1,
        px: 2,
        gap: 1,
        boxShadow: 'sm',
    }}>
        <GlobalStyles
            styles={(theme) => ({
                ':root': {
                    '--Header-height': '52px',
                    [theme.breakpoints.up('md')]: {
                        '--Header-height': '0px',
                    },
                },
            })}
        />
        <IconButton
            variant="outlined"
            size="sm"
            onClick={() => toggleSidebar()}
            sx={{
                '&:focus': {
                    outline: 'none'
                },
            }}
        >
            <i data-feather="menu" />
        </IconButton>
        <ColoredSchemeToggle />
    </Sheet>
}