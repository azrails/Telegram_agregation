import Grid from "@mui/joy/Grid"
import Stack from "@mui/joy/Stack"
import HeaderSection from "../../CommonComponents/HeaderSection"
import Divider from "@mui/joy/Divider"
import ProjectCard from "../../CommonComponents/Cards/ProjectCard"
import { useEffect, useState } from "react"
import $api from "../../../lib/api"


const groups = {
    'undef': '',
    'buisness': 'Бизнес',
    'finance': 'Финансы',
    'traveling': 'Путешествия'
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [reload, setReload] = useState(false);

    async function getProjects(){
        let response_data;
        try{
            response_data = await (await $api.get('projects/')).data
        }
        catch {
            response_data = []
        }
        return response_data
    }
    useEffect(() => {
        (async () => {
            const results = await getProjects();
            setProjects(results);
        })()
        setReload(false);
    },[reload])
    return <Grid container sx={{ m: 0, width: { xs: '100vw', md: '96vw' }, height: '100%' }}>
        <Grid xs={12} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 8, md: 4 },
            pb: 5,
        }}>
            <Stack spacing={2}>
                <HeaderSection />
                <Divider />
                {projects.map((e, index) => <ProjectCard id={e.id} title={e.title} description={e.description} category={groups[e.group_id?.title]} key={index} setReload={setReload}/>)}
            </Stack>
        </Grid>
    </Grid>
}