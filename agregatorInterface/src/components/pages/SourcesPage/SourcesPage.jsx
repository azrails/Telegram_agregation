import Grid from "@mui/joy/Grid"
import Stack from "@mui/joy/Stack"
import Divider from "@mui/joy/Divider";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import $api from '../../../lib/api'
import Card from "@mui/joy/Card"
import CardActions from "@mui/joy/CardActions"
import { Link } from "react-router-dom"
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from "@mui/joy/IconButton"
import { observer } from 'mobx-react-lite'
import Sources from "../../../store/Sources";

function ButtonGroup({ id }) {
    return <Stack spacing={1}
        direction={{ xs: 'column', md: 'row' }}
        flex={1}
        justifyContent="flex-end"
        alignItems="center">
        <IconButton size="md" component={Link} to={`edit/${id}`}>
            <EditIcon />
        </IconButton>
        <IconButton size="md" onClick={() => Sources.deleteSourceById(id)}>
            <CloseIcon />
        </IconButton>
    </Stack>
}

const source_types = { 'telegram': 'Telegram' }
function SourceCard({ id, title, url, type }) {
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
        <Stack sx={{ padding: { xs: 2, sm: 0 }, overflow: 'hidden'}} spacing={1} flex={1}>
            <Stack spacing={1} direction='row' justifyContent='space-between' alignItems='center'>
                <div>
                    <Typography color="primary" fontSize='sm' fontWeight='lg'>
                        {source_types[type]}
                    </Typography>
                    <Typography fontWeight="title-md" level="h3" fontStyle="lg">
                        {title}
                    </Typography>
                </div>
            </Stack>
            <Typography color="neutral" level="body-sm" variant="plain">
                {url}
            </Typography>
        </Stack>
        <CardActions sx={{ mr: 2, my: 2 }}>
            <ButtonGroup id={id} />
        </CardActions>
    </Card>
}

const SourcesPage = observer(() => {
    const handleIntersecting = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting){
                Sources.fetchSoources();
                observer.unobserve(entry.target);
            }
        })
    }
    const observer = new IntersectionObserver(handleIntersecting, {rootMargin: '0px 0px 0px 0px', threshold: 0});
    useEffect(() => {
        observer.observe(document.querySelector('#sources-tape > :last-child'));
        return () => {
            observer.disconnect();
        }
    }, [Sources.sources])
    return <Grid container sx={{ m: 0, width: { xs: '100vw', md: '96vw' }, height: '100%' }}>
        <Grid xs={12} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 8, md: 4 },
            pb: 5,
        }}>
            <Stack spacing={2} id="sources-tape">
                <Typography
                    level="h1"
                    fontSize={{ xs: 'xl2', md: 'xl4' }}
                    fontWeight='md'
                    fontStyle='lg'
                >
                    Все источники
                </Typography>
                <Divider />
                {Sources.sources.map((e, i) => <SourceCard key={e.id} id={e.id} title={e.title} url={e.url} type={e.type}/>)}
            </Stack>
        </Grid>
    </Grid>
})
export default SourcesPage;