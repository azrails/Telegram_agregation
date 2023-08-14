import { useColorScheme } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import IconButton from "@mui/joy/IconButton"
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";

export function ColoredSchemeToggleMenu({ onClick, sx, ...props }) {
    const { mode, setMode } = useColorScheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return <ListItem><ListItemButton {...props} sx={sx} disabled /></ListItem>;
    }
    return <ListItem>
        <ListItemButton
            onClick={(event) => {
                if (mode === 'light') {
                    setMode('dark');
                } else {
                    setMode('light');
                }
                onClick?.(event);
            }}
            sx={[
                {
                    '& > *:first-of-type': {
                        display: mode === 'dark' ? 'none' : 'initial',
                    },
                    '& > *:last-of-type': {
                        display: mode === 'light' ? 'none' : 'initial',
                    },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}

        >
            <i data-feather="moon" />
            <i data-feather="sun" />
        </ListItemButton>
    </ListItem>
}

export default function ColoredSchemeToggle({ onClick, sx, ...props }) {
    const { mode, setMode } = useColorScheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            {...props}
            sx={sx}
            disabled
        />
    }
    return <IconButton
        size="sm"
        variant="outlined"
        color="neutral"
        {...props}
        onClick={(event) => {
            if (mode === 'light') {
                setMode('dark');
            } else {
                setMode('light');
            }
            onClick?.(event);
        }}
        sx={[
            {
                ml: 'auto',
                '& > *:first-of-type': {
                    display: mode === 'dark' ? 'none' : 'initial',
                },
                '& > *:last-of-type': {
                    display: mode === 'light' ? 'none' : 'initial',
                },
                '&:focus':{
                    outline: 'none'
                },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
        ]}
    >
        <i data-feather="moon" />
        <i data-feather="sun" />
    </IconButton>
}

