import Grid from "@mui/joy/Grid";
import { useParams } from "react-router-dom";
import Stack from "@mui/joy/Stack";
import Divider from "@mui/joy/Divider";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import IconButton from "@mui/joy/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import $api from "../../../lib/api";
import { observer } from "mobx-react-lite";
import Projects from "../../../store/Projects";
import Card from "@mui/joy/Card";
import CloseIcon from '@mui/icons-material/Close'
import CardActions from "@mui/joy/CardActions"


function PostCard({ id, date, summary, handleDeletePost }) {
    const trueDate = new Date(date).toLocaleString()
    return <Card variant="outlined"
        orientation="horizontal"
        sx={{
            transition: '250ms all',
            padding: { xs: 0, md: 2 },
            borderRadius: 'sm',
            boxShadow: 'none',
            '&:hover': {
                boxShadow: 'md',
                borderColor: 'neutral.outlinedHoverBorder'
            }
        }}>
        <Stack sx={{ padding: { xs: 2, sm: 0 }, overflow: 'hidden' }} spacing={1} flex={1}>
            <Stack spacing={1} direction='row' justifyContent='space-between' alignItems='center'>
                <Typography color="primary" fontSize='sm' fontWeight='lg'>
                    {trueDate}
                </Typography>
            </Stack>
            <Typography color="neutral" level="body-sm" variant="plain">
                {summary}
            </Typography>
        </Stack>
        <CardActions sx={{ mr: 2, my: 2 }}>
            <Stack spacing={1}
                direction={{ xs: 'column', md: 'row' }}
                flex={1}
                justifyContent="flex-end"
                alignItems="center">
                <IconButton size="md" onClick={() => handleDeletePost(id)}>
                    <CloseIcon />
                </IconButton>
            </Stack>
        </CardActions>
    </Card>
}

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
            <IconButton size="lg" onClick={() => navigate(-1)} sx={{
                '&:focus': {
                    outline: 'none'
                },
            }}>
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

const ProjectPage = observer(() => {
    const projectId = parseInt(useParams().projectId);
    const currentProject = Projects.getProjectById(projectId);
    const [gptPosts, setGptPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [maxCounts, setMaxCounts] = useState(-1);

    const loadPosts = async () => {
        if (maxCounts !== gptPosts.length) {
            const response = await (await $api.get(`gpt_posts/project_posts/${projectId}/?page=${page}`)).data
            setPage(page + 1);
            setMaxCounts(response.count)
            setGptPosts([...gptPosts, ...response.results])
        }
    }

    const handleIntersecting = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadPosts();
                observer.unobserve(entry.target)
            }
        })
    }

    const handleDeletePost = async (id) => {
        const position = gptPosts.findIndex(e => e.id === id)
        setMaxCounts(maxCounts - 1);
        if (position === 0) {
            setGptPosts(gptPosts.slice(1))
        }
        else if (position === gptPosts.length) {
            setGptPosts(gptPosts.slice(0, -1))
        }
        else {
            setGptPosts([...gptPosts.slice(0, position), ...gptPosts.slice(position + 1)])
        }
        $api.delete(`gpt_posts/${id}/`)
    }

    const observer = new IntersectionObserver(handleIntersecting, { rootMargin: '0px 0px 0px 0px', threshold: 0 })

    useEffect(() => {
        observer.observe(document.querySelector('#projects-tape > :last-child'));
        return () => {
            observer.disconnect()
        }
    }, [gptPosts])


    return <Grid container sx={{ m: 0, width: { xs: '100vw', md: '96vw' }, height: '100%' }}>
        <Grid xs={12} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 8, md: 4 },
            pb: 5,
        }}>
            <Stack spacing={2} sx={{ overflow: 'hidden' }} id='projects-tape'>
                <ProjectHeader title={currentProject?.title} description={currentProject?.description} />
                <Divider />
                {gptPosts.map(post => (<PostCard key={post.id} id={post.id} date={post.date} summary={post.summary} handleDeletePost={handleDeletePost} />))}
            </Stack>
        </Grid></Grid>
})

export default ProjectPage;