import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import Grid from "@mui/joy/Grid"
import Stack from "@mui/joy/Stack"
import IconButton from "@mui/joy/IconButton"
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Divider from "@mui/joy/Divider"
import { useNavigate } from "react-router-dom";
import Typography from "@mui/joy/Typography"
import Box from '@mui/joy/Box'
import Input from '@mui/joy/Input'
import Sources from '../../../store/Sources'
import { useEffect, useState } from "react";
import Button from "@mui/joy/Button"
import List from '@mui/joy/List';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';


function HeaderSection() {
    const navigate = useNavigate();
    return <Stack
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
    </Stack>
}

const EditSource = observer(() => {
    const params = useParams();
    const navigate = useNavigate();
    const source = Sources.getSourceById(parseInt(params.sourceId));
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    useEffect(() => {
        setTitle(source.title);
        setUrl(source.url);
    }, [source]);
    const handleSave = () => {
        Sources.modifySourceById(parseInt(params.sourceId), { ...source, title: title, url: url });
        navigate(-1);
    }
    return <Grid container sx={{ m: 0, width: { xs: '100vw', md: '96vw' } }}>
        <Grid xs={12} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 8, md: 4 },
            pb: { xs: 2, md: 2 },
        }}>
            <Stack spacing={2}>
                <HeaderSection />
                <Divider />
            </Stack>
        </Grid>
        <Grid xs={12} md={6} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 2, md: 2 },
            pb: { xs: 2, md: 5 },
        }}>
            <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                    <Typography level="h4" color="neutral">
                        Название источника:
                    </Typography>
                    <Input placeholder="..." size="lg"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                    <Typography level="h4" color="neutral">
                        URL:
                    </Typography>
                    <Input placeholder="..." size="lg"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                </Box>
            </Stack>
        </Grid>
        <Grid xs={12} sm={6} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 2, md: 2 },
            pb: { xs: 2, md: 5 },
        }}>
            <Typography level="h4" color="neutral">Связанные проекты:</Typography>
            <List
                sx={{
                    minWidth: 240,
                    borderRadius: 'sm',
                }}
            >
                {source.projects_list.map(e => <ListItem key={e}>
                    {e}
                </ListItem>)}
            </List>
        </Grid>
        <Grid xs={12} sm={3} sx={{
            h: '100%', px: { xs: 2, md: 4 },
            pt: { xs: 2, md: 2 },
            pb: { xs: 2, md: 5 },
        }}>
            <Button size="lg" sx={{ width: "100%" }} onClick={() => handleSave()}>Сохранить</Button>
        </Grid>
    </Grid>
})

export default EditSource;