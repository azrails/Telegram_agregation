import Grid from "@mui/joy/Grid"
import Stack from "@mui/joy/Stack"
import IconButton from "@mui/joy/IconButton"
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from "react-router-dom"
import Divider from "@mui/joy/Divider"
import Typography from "@mui/joy/Typography"
import RadioGroup from '@mui/joy/RadioGroup'
import Radio from "@mui/joy/Radio"
import Box from '@mui/joy/Box'
import { useEffect, useState } from "react"
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import ListItemButton from '@mui/joy/ListItemButton'
import Add from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import TextArea from "@mui/joy/Textarea"
import Input from '@mui/joy/Input'
import Modal from '@mui/joy/Modal'
import ModalDialog from '@mui/joy/ModalDialog'
import FormControl from '@mui/joy/FormControl'
import FormLabel from "@mui/joy/FormLabel"
import Select from "@mui/joy/Select"
import Option from "@mui/joy/Option"
import Button from "@mui/joy/Button"
import Autocomplete from "@mui/joy/Autocomplete"
import $api from '../../../lib/api'
import ButtonGroup from '@mui/joy/ButtonGroup'

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
        <IconButton size="lg" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
        </IconButton>
    </Stack>
}

const times = { '1:00:00': 'Час', '00:00:00': 'День' }
const source_types = { 'telegram': 'Telegram' }

export default function CreateProject() {
    const [time, setTime] = useState('1:00:00');
    const [open, setOpen] = useState(false);
    const [sourceType, setSourceType] = useState('telegram');
    const [sources, setSources] = useState([]);
    const [inputValue, setInputValue] = useState('')
    const [usingSources, setUsingSources] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false)
    const [reload, setReload] = useState(false);
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDescription, setProjectDescription] = useState('');

    const navigate = useNavigate();

    const deleteSourceElement = index => {
        let new_list = [];
        if (index === 0) {
            new_list = usingSources.slice(1);
        }
        else if (index === usingSources.length - 1) {
            new_list = usingSources.slice(0, -1);
        }
        else {
            new_list = new_list.concat(usingSources.slice(0, index), usingSources.slice(index + 1))
        }
        setUsingSources(new_list);
    }

    const createNewProject = async () => {
        try {
            const response = await $api.post('projects/', {
                title: projectTitle,
                description: projectDescription,
                update_time: time,
                sourses: usingSources
            })
            console.log(response)
            navigate(-1);
        }
        catch {
            console.log('create project error')
        }
    }

    const createNewSource = async () => {
        try {
            const response = await $api.post('sources/', {
                type: sourceType,
                title: resourceTitle,
                url: resourceUrl,
            })
            setReload(true);
        }
        catch {
            console.log('create source error')
        }
    }

    useEffect(() => {
        (async () => {
            const results = (await $api.get('sources/')).data
            setSources(results)
            setReload(false);
        })()
    }, [reload])

    return <>
        <Modal open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
            <ModalDialog
                aria-labelledby="basic-modal-dialog-title"
                aria-describedby="basic-modal-dialog-description"
                sx={{ maxWidth: 500 }}
            >
                <Typography id="basic-modal-dialog-title" level="h2" textAlign='center'>
                    Источник
                </Typography>
                <Typography id="basic-modal-dialog-description" level="body-lg" color="neutral" textAlign='center'>
                    Выберите источники
                </Typography>
                <Stack spacing={2}>
                    <Divider>Выбрать источник</Divider>
                    <Autocomplete multiple options={sources}
                        getOptionLabel={option => option.title}
                        value={usingSources}
                        onChange={(_, newValue) => setUsingSources(newValue)}
                        inputValue={inputValue}
                        onInputChange={(_, newValue) => setInputValue(newValue)}
                    />
                    <Button onClick={() => {
                        setInputValue(''); setOpenAddDialog(false)
                    }}>Сохранить</Button>
                </Stack>
            </ModalDialog>
        </Modal>
        <Modal open={open} onClose={() => setOpen(false)}>
            <ModalDialog
                aria-labelledby="basic-modal-dialog-title"
                aria-describedby="basic-modal-dialog-description"
                sx={{ maxWidth: 500 }}
            >
                <Typography id="basic-modal-dialog-title" level="h2" textAlign='center'>
                    Источник
                </Typography>
                <Typography id="basic-modal-dialog-description" level="body-lg" color="neutral" textAlign='center'>
                    Cоздайте новый источник
                </Typography>
                <Stack spacing={2}>
                    <Divider>Создать источник</Divider>
                    <FormControl>
                        <FormLabel>Тип источника</FormLabel>
                        <Select size="lg" defaultValue={sourceType} onChange={(_, newValue) => setSourceType(newValue)}
                            sx={{ '--Select-focusedHighlight': 'none' }}>
                            {['telegram'].map((value) => <Option key={value} value={value}>{source_types[value]}</Option>)}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Название ресурса</FormLabel>
                        <Input placeholder="Название..." size="lg" value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Ссылка на канал</FormLabel>
                        <Input placeholder="Url..." size="lg" value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} />
                    </FormControl>
                    <Button onClick={() => {
                        setOpen(false);
                        createNewSource();
                        setSourceType('telegram');
                        setResourceTitle('');
                        setResourceUrl('');
                    }}>Создать</Button>
                </Stack>
            </ModalDialog>
        </Modal>
        <Grid container sx={{ m: 0, width: { xs: '100vw', md: '96vw' } }}>
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
                            Название проекта:
                        </Typography>
                        <Input placeholder="Новый проект..." size="lg"
                            value={projectTitle}
                            onChange={e => setProjectTitle(e.target.value)}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                        <Typography level="h4" color="neutral">
                            Описание:
                        </Typography>
                        <TextArea placeholder="..." size="lg" sx={{ minWidth: { md: 300 } }}
                            value={projectDescription}
                            onChange={e => setProjectDescription(e.target.value)}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                        <Typography level="h4" color="neutral">
                            Периодичность обновлений:
                        </Typography>
                        <RadioGroup
                            orientation="horizontal"
                            aria-labelledby="segmented-controls-example"
                            name="time"
                            value={time}
                            onChange={(event) => setTime(event.target.value)}
                            sx={{
                                minHeight: 48,
                                padding: '4px',
                                borderRadius: '12px',
                                bgcolor: 'neutral.softBg',
                                '--RadioGroup-gap': '4px',
                                '--Radio-actionRadius': '8px',
                            }}
                        >
                            {['1:00:00', '00:00:00'].map(item => (
                                <Radio
                                    key={item}
                                    color="neutral"
                                    value={item}
                                    disableIcon
                                    label={times[item]}
                                    variant="plain"
                                    sx={{
                                        px: 2,
                                        alignItems: 'center',
                                    }}
                                    slotProps={{
                                        action: ({ checked }) => ({
                                            sx: {
                                                ...(checked && {
                                                    bgcolor: 'background.surface',
                                                    boxShadow: 'sm',
                                                    '&:hover': {
                                                        bgcolor: 'background.surface',
                                                    },
                                                }),
                                            },
                                        }),
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </Box>
                    <Divider sx={{ display: { md: 'none' } }}>Начальный промт</Divider>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                        <Typography level="h4" color="neutral">
                            Название:
                        </Typography>
                        <Input placeholder="Новый промт..." size="lg" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                        <Typography level="h4" color="neutral">
                            Текст промта:
                        </Typography>
                        <TextArea placeholder="..." size="lg" sx={{ minWidth: { md: 300 } }} />
                    </Box>
                </Stack></Grid>
            <Grid xs={12} md={6} sx={{
                h: '100%', px: { xs: 2, md: 4 },
                pt: { xs: 2, md: 2 },
                pb: { xs: 2, md: 5 },
            }}>
                <Divider sx={{ display: { md: 'none' }, mb: { xs: 2, md: 'none' } }}>Список источников</Divider>
                <Button variant="outlined" size="lg" color="neutral" sx={{ width: '100%' }} onClick={() => { setOpen(true) }}>Создать новый источник</Button>
                <List sx={{ maxWidth: { md: 500 } }}>
                    <ListItem
                        onClick={() => { setOpenAddDialog(true) }}
                        startAction={
                            <Add />
                        }
                    >
                        <ListItemButton>Добавить источники</ListItemButton>
                    </ListItem>
                    {usingSources.map((element, index) => (<ListItem key={element.id}
                        endAction={
                            <ButtonGroup onClick={() => deleteSourceElement(index)}>
                                <IconButton>
                                    <CloseIcon />
                                </IconButton>
                            </ButtonGroup>
                        }
                    >
                        <Typography variant="body-lg" color="neutral">
                            {element.title}
                        </Typography>
                    </ListItem>))}
                </List>
            </Grid>
            <Grid xs={12} sm={3} sx={{
                h: '100%', px: { xs: 2, md: 4 },
                pt: { xs: 2, md: 2 },
                pb: { xs: 2, md: 5 },
            }}>
                <Button size="lg" sx={{ width: "100%" }} onClick={() => createNewProject()}>Сохранить</Button>
            </Grid>
        </Grid></>
}