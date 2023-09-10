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

import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import EditIcon from '@mui/icons-material/Edit'
import Sheet from '@mui/joy/Sheet';
import Radio from "@mui/joy/Radio"
import Button from "@mui/joy/Button";
import { Link } from "react-router-dom";

import Skeleton from '@mui/joy/Skeleton';


const dateOffset = {
    '01:00:00': 1000 * 60 * 60,
    '00:00:00': 1000 * 60 * 60 * 24
}


export const prepareSummary = (summary) => {
    const newSummary = []
    const regex = /((?:https?:\/\/|ftps?:\/\/|\bwww\.)(?:(?![.,?!;:()]*(?:\s|$))[^\s]){2,})|(\n+|(?:(?!(?:https?:\/\/|ftp:\/\/|\bwww\.)(?:(?![.,?!;:()]*(?:\s|$))[^\s]){2,}).)+)/gim;
    summary.replace(regex, (m, link, text, salt) => {
        newSummary.push(link ? <Link to={link} key={link + text + salt}>{link}</Link> : text);
    })
    return newSummary
}

function PostCard({ id, date, summary, handleDeletePost, longType, setOpen, setEditPromtId, promtId, setPostId }) {
    const trueDate = new Date(date)
    const endDate = new Date(+trueDate - dateOffset[longType]);
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
                    {`${trueDate.toLocaleString()} - ${endDate.toLocaleString()}`}
                </Typography>
            </Stack>
            <Typography color="neutral" level="body-sm" variant="plain">
                {prepareSummary(summary)}
            </Typography>
        </Stack>
        <CardActions sx={{ mr: 2, my: 2 }}>
            <Stack spacing={1}
                direction={{ xs: 'column', md: 'row' }}
                flex={1}
                justifyContent="flex-end"
                alignItems="center">
                <IconButton size="md" onClick={() => { setOpen(true); setEditPromtId(promtId); setPostId(id) }} sx={{
                    '&:focus': {
                        outline: 'none'
                    }
                }}>
                    <EditIcon />
                </IconButton>
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
    const [open, setOpen] = useState(false);
    const [editPromtId, setEditPromtId] = useState(null);
    const [postId, setPostId] = useState(null);
    const [loadingProject, setLoadingProject] = useState(true);

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
        if (loadingProject == false) {
            observer.observe(document.querySelector('#projects-tape > :last-child'));
        }
        else{
            (async () => {
                if (!currentProject){
                    const response = (await $api.get(`projects/${projectId}/`)).data
                    Projects.appendProject(response);
                }
                setLoadingProject(false);
            })()
        }
        return () => {
            observer.disconnect()
        }
    }, [gptPosts, loadingProject])

    const regeneratePost = async (postId) => {
        const position = gptPosts.findIndex(e => e.id === postId)
        setOpen(false);
        const response = await $api.post(`gpt_posts/${postId}/generate_posts/`, {
            post_id: postId,
            project_id: projectId,
            long_type: gptPosts[position].long_type,
            date: new Date(gptPosts[position].date).getTime(),
            promt_id: editPromtId
        });
        if (Object.keys(response.data).length !== 0) {
            setGptPosts([response.data, ...gptPosts]);
        };
    }

    return <>
        {loadingProject ? <></> :
            <Modal open={open} onClose={() => { setOpen(false); setEditPromtId(null); setPostId(null) }}>
                <ModalDialog
                    aria-labelledby="basic-modal-dialog-title"
                    aria-describedby="basic-modal-dialog-description"
                    sx={{ maxWidth: 500 }}
                >
                    <Typography id="basic-modal-dialog-title" level="h2" textAlign='center'>
                        Пересоздать пост
                    </Typography>
                    <Stack spacing={2}>
                        <Divider>Доступные промты</Divider>
                        {currentProject.promts.map((value) => (
                            <Sheet
                                key={value.id}
                                sx={{
                                    p: 2,
                                    borderRadius: 'md',
                                    boxShadow: 'sm',
                                }}
                            >
                                <Radio
                                    label={`${value.description}`}
                                    overlay
                                    disableIcon
                                    onClick={() => setEditPromtId(value.id)}
                                    checked={value.id === editPromtId}
                                    value={value.description}
                                    slotProps={{
                                        label: ({ checked }) => ({
                                            sx: {
                                                fontWeight: 'lg',
                                                fontSize: 'md',
                                                color: checked ? 'text.primary' : 'text.secondary',
                                            },
                                        }),
                                        action: ({ checked }) => ({
                                            sx: (theme) => ({
                                                ...(checked && {
                                                    '--variant-borderWidth': '2px',
                                                    '&&': {
                                                        // && to increase the specificity to win the base :hover styles
                                                        borderColor: theme.vars.palette.primary[500],
                                                    },
                                                }),
                                            }),
                                        }),
                                    }}
                                />
                            </Sheet>
                        ))}
                        <Button
                            onClick={() => regeneratePost(postId)}
                        >Пересоздать</Button>
                    </Stack>
                </ModalDialog>
            </Modal>
        }
        <Grid container sx={{ m: 0, width: { xs: '100vw', md: '96vw' }, height: '100%' }}>
            <Grid xs={12} sx={{
                h: '100%', px: { xs: 2, md: 4 },
                pt: { xs: 8, md: 4 },
                pb: 5,
            }}>
                <Stack spacing={2} sx={{ overflow: 'hidden' }} id='projects-tape'>
                    {loadingProject ? <></> : <>
                        <ProjectHeader title={currentProject?.title} description={currentProject?.description} />
                        <Divider />
                        {gptPosts.map(post => (<PostCard key={post.id} id={post.id} date={post.date} summary={post.summary} handleDeletePost={handleDeletePost}
                            longType={post.long_type}
                            setOpen={setOpen}
                            promtId={post.promt_id}
                            setEditPromtId={setEditPromtId}
                            setPostId={setPostId}
                        />))}
                    </>
                    }
                </Stack>
            </Grid></Grid></>
})

export default ProjectPage;
