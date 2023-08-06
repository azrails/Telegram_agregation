import Grid from "@mui/joy/Grid"
import Stack from "@mui/joy/Stack"
import HeaderSection from "../../CommonComponents/HeaderSection"
import Divider from "@mui/joy/Divider"
import ProjectCard from "../../CommonComponents/Cards/ProjectCard"

const projects = [{ id: 1, title: 'Финансы', 
description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
 category: 'Биржа' },
{
    id: 2,
    title: 'Релокация',
    category: 'Путешествия',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
}];

export default function ProjectsPage() {
    return <Grid container sx={{ m: 0, width: { xs: '100vw', md: '96vw' }, height: '100%' }}>
        <Grid xs={12} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 8, md: 4 },
            pb: 5,
        }}>
            <Stack spacing={2}>
                <HeaderSection />
                <Divider />
                {projects.map((e, index) => <ProjectCard id={e.id} title={e.title} description={e.description} category={e.category} key={index} />)}
            </Stack>
        </Grid>
    </Grid>
}