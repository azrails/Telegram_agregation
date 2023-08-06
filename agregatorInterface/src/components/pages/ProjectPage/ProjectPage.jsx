import Grid from "@mui/joy/Grid";
import { useParams } from "react-router-dom";
import Stack from "@mui/joy/Stack";
import Divider from "@mui/joy/Divider";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import IconButton from "@mui/joy/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import TimeSummaryCard from "../../CommonComponents/Cards/TimeSummaryCard";

const projects = [{
    id: 1, title: 'Финансы',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    category: 'Биржа',
    summary: [
        {
            timeStart: '0:00', 
            timeEnd: '0:00',
            date: '24.8.2023',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            timeStart: '14:00', 
            timeEnd: '15:00',
            date: '24.12.2023',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            timeStart: '0:00', 
            timeEnd: '0:00',
            date: '24.10.2023',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            timeStart: '0:00', 
            timeEnd: '0:00',
            date: '24.9.2023',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            timeStart: '14:00', 
            timeEnd: '15:00',
            date: '24.15.2023',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            timeStart: '0:00', 
            timeEnd: '0:00',
            date: '24.20.2023',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        }
    ]
},
{
    id: 2,
    title: 'Релокация',
    category: 'Путешествия',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    summary: [
        {
            timeStart: '0:00', 
            timeEnd: '0:00',
            date: '24.8.2023',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            timeStart: '14:00', 
            timeEnd: '15:00',
            date: '24.12.2023',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            timeStart: '0:00', 
            timeEnd: '0:00',
            date: '24.10.2023',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        }
    ]
}];

const ProjectHeader = ({ title, description }) => {
    const navigate = useNavigate();
    return <Stack direction={{ xs: 'column' }}>
        <Stack
            sx={{ pr: 3 }}
            direction={{
                xs: 'row',
            }}
            alignItems="center"
            gap={1}
            spacing={2}
        >
            <IconButton size="lg" onClick={() => navigate(-1)}>
                <ArrowBackIcon />
            </IconButton>
            <div>
                <Typography
                    level="h1"
                    fontSize={{ xs: 'xl2', md: 'xl4' }}
                    fontWeight='md'
                    fontStyle='lg'
                >
                    {title}
                </Typography>
            </div>
        </Stack>
        <Typography color="neutral" level="body-sm" variant="plain" sx={{ px: 2, pt: 1 }}>
            {description}
        </Typography>
    </Stack>
}

export default function ProjectPage() {
    const projectId = parseInt(useParams().projectId);
    const [currentProject, setCurrentProject] = useState(null)
    useEffect(() => {
        projects.find(e => e.id === projectId);
        setCurrentProject(projects.find(e => e.id === projectId))
    }, [])
    return <Grid container sx={{ m: 0, width: { xs: '100vw', md: '96vw' }, height: '100%' }}>
        <Grid xs={12} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 8, md: 4 },
            pb: 5,
        }}>
            <Stack spacing={2}>
                <ProjectHeader title={currentProject?.title} description={currentProject?.description} />
                <Divider />
                {currentProject?.summary.map(e => <TimeSummaryCard summary={e} key={e.date}/>)}
            </Stack>
        </Grid></Grid>
}