import Box from "@mui/joy/Box"
import Header from "../../CommonComponents/Header/Header"
import GlobalStyles from "@mui/joy/GlobalStyles"
import { useEffect, useLayoutEffect } from "react";
import useScript from "../../../useScript";
import SideBar from "../../CommonComponents/SideBar/SideBar";
import { Outlet } from "react-router-dom";

function Main({ children }) {
    return <Box component="main"
        className="MainContent"
        sx={{ flex: 1 }}
    >{children}</Box>
}

const useEnhancedEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function MainPage() {
    const status = useScript(`https://unpkg.com/feather-icons`);

    useEnhancedEffect(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }, [status]);
    return <Box
        sx={{
            display: "flex",
            minHeight: "100dvh",
            height: '100%',
            minHeight: '100vh',
        }}
    >
        <GlobalStyles styles={(theme) => ({
            '[data-feather], .feather': {
                color: `var(--Icon-color, ${theme.vars.palette.text.icon})`,
                margin: 'var(--Icon-margin)',
                fontSize: `var(--Icon-fontSize, ${theme.vars.fontSize.xl})`,
                width: '1em',
                height: '1em',
            },
        })} />
        <Header />
        <SideBar />
        <Main>
            <Outlet />
        </Main>
    </Box>
}