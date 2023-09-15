import Grid from "@mui/joy/Grid"
import Stack from "@mui/joy/Stack"
import HeaderSection from "../../CommonComponents/HeaderSection"
import Divider from "@mui/joy/Divider"
import ProjectCard from "../../CommonComponents/Cards/ProjectCard"
import { useEffect, useState } from "react"
import Projects from "../../../store/Projects"
import { observer } from "mobx-react-lite"


const groups = {
    'undef': '',
    'buisness': 'Бизнес',
    'finance': 'Финансы',
    'traveling': 'Путешествия'
}

const ProjectsPage = observer(() => {
    const handleIntersecting = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting){
                Projects.fetchProjects();
                observer.unobserve(entry.target);
            }
        })
    }

    const observer = new IntersectionObserver(handleIntersecting, {rootMargin: '0px 0px 0px 0px', threshold: 0})

    useEffect(() => {
        observer.observe(document.querySelector('#projects-tape > :last-child'));
        return () => {
            observer.disconnect()
        }
    },[Projects.projects])

    return <Grid container sx={{ m: 0, width: { xs: '100vw', md: '94vw' }, height: '100%' }}>
        <Grid xs={12} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 8, md: 4 },
            pb: 5,
        }}>
            <Stack spacing={2} id='projects-tape'>
                <HeaderSection />
                <Divider />
                {Projects.projects.map((e, index) => <ProjectCard id={e.id} title={e.title} description={e.description} category={groups[e.group_id?.title]} key={index}/>)}
            </Stack>
        </Grid>
    </Grid>
})

export default ProjectsPage;