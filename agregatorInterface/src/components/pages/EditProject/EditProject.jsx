import Grid from "@mui/joy/Grid"
import Stack from "@mui/joy/Stack"
import IconButton from "@mui/joy/IconButton"
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useLoaderData, useNavigate, useParams } from "react-router-dom"
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
import Projects from "../../../store/Projects"
import Sheet from '@mui/joy/Sheet';
import { observer } from "mobx-react-lite"
import Sources from "../../../store/Sources"

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

const times = { '01:00:00': 'Час', '00:00:00': 'День', '02:00:00': 'Неделя' }
const source_types = { 'telegram': 'Telegram' }

const EditProject = observer(() => {
    const param = useParams();
    const project = Projects.getProjectById(parseInt(param.projectId))
    const [time, setTime] = useState(project.update_time);
    const [open, setOpen] = useState(false);
    const [sourceType, setSourceType] = useState('telegram');
    const [sources, setSources] = useState([]);
    const [inputValue, setInputValue] = useState('')
    const [usingSources, setUsingSources] = useState(project.sourses);
    const [openAddDialog, setOpenAddDialog] = useState(false)
    const [reload, setReload] = useState(false);
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');
    const [projectTitle, setProjectTitle] = useState(project.title);
    const [projectDescription, setProjectDescription] = useState(project.description);
    const [currentPromtDescription, setCurrentPromtDescription] = useState('');
    const [currentPromtText, setCurrentPromtText] = useState('');
    const [addPromtDialog, setAddPromtDialog] = useState(false);
    const [addPromtDescription, setAddPromtDescription] = useState('')
    const [addPromtText, setAddPromtText] = useState('')

    useEffect(() => {
        setCurrentPromtDescription(project.promts.find(e => e.id === project.current_promt)?.description);
        setCurrentPromtText(project.promts.find(e => e.id === project.current_promt)?.promt_text);
    }, [project.current_promt])

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
        const validSources = []
        for (let source of usingSources){
            if (source.hasOwnProperty('id')){
                validSources.push(source)
            }
            else{
                const response = await $api.post(`sources/`, source)
                console.log(response.data)
                validSources.push(response.data)
            }
        }
        Projects.modifyProjectById(project.id, {
            ...project,
            title: projectTitle,
            description: projectDescription,
            update_time: time,
            sourses: validSources,
            promtDescription: currentPromtDescription,
            promtText: currentPromtText
        })
        navigate(-1);
    }

    const createNewSource = async () => {
        try {
            const response = await $api.post('sources/', {
                type: sourceType,
                title: resourceTitle,
                url: resourceUrl,
            })
            Sources.sources.push(response.data);
            Sources.count++;
            setReload(true);
        }
        catch {
            console.log('create source error')
        }
    }

    const createNewPromt = () => {
        Projects.createPromt(project.id, { description: addPromtDescription, promt_text: addPromtText, project_id: project.id })
    }

    useEffect(() => {
        (async () => {
            const results = []
            let response = (await $api.get('sources/?page=1')).data
            results.push(...response.results)
            let i = 2;
            while (response.next){
                response = (await $api.get(`sources/?page=${i}`)).data
                i++;
                results.push(...response.results)
            }
            const extraSources = await $api.get('sources/extra_sources/')
            setSources([...results, ...extraSources.data.filter(extraSource => !results.some(resSource => (extraSource.title === resSource.title ? true : false)))])
            setReload(false);
        })()
    }, [reload])

    return <>
        <Modal open={addPromtDialog} onClose={() => setAddPromtDialog(false)}>
            <ModalDialog aria-labelledby="basic-modal-dialog-title"
                aria-describedby="basic-modal-dialog-description"
                sx={{ maxWidth: 500 }}>
                <Typography id="basic-modal-dialog-title" level="h2" textAlign='center'>
                    Промт
                </Typography>
                <Stack spacing={2}>
                    <Divider>Новый промт</Divider>
                    <FormControl>
                        <FormLabel>Название промта</FormLabel>
                        <Input placeholder="Название..." size="lg" value={addPromtDescription} onChange={e => setAddPromtDescription(e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Текст промта</FormLabel>
                        <TextArea placeholder="..." size="lg" value={addPromtText} onChange={e => setAddPromtText(e.target.value)} />
                    </FormControl>
                    <Button onClick={() => {
                        createNewPromt();
                        setAddPromtDialog(false);
                        setAddPromtText('');
                        setAddPromtDescription('');
                    }}>Сохранить</Button>
                </Stack>
            </ModalDialog>
        </Modal>
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
                <Stack spacing={2} sx={{maxWidth: 350}}>
                    <Divider>Выбрать источник</Divider>
                    <Autocomplete multiple options={sources}
                        getOptionLabel={option => option.title}
                        value={usingSources}
                        onChange={(_, newValue) => setUsingSources(newValue)}
                        inputValue={inputValue}
                        onInputChange={(_, newValue) => setInputValue(newValue)}
                        isOptionEqualToValue={(o, v) => o.id === v.id && o.title === v.title}
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
                            sx={{ '--Select-focusedHighlight': 'none' }}
                            slotProps={{
                                listbox: {
                                    placement: 'bottom-start',
                                    sx: { minWidth: 160 },
                                },
                                button: {
                                    sx: { '&:focus': { outline: 'none' } }
                                }
                            }}
                        >
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap'}}>
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
                            {['01:00:00', '00:00:00', '02:00:00'].map(item => (
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
                    <Divider sx={{ display: { md: 'none' } }}>Промты</Divider>
                    <RadioGroup
                        aria-labelledby="storage-label"
                        defaultValue="512GB"
                        size="lg"
                        sx={{ gap: 1.5 }}
                    >
                        {project.promts.map((value) => (
                            <Sheet
                                key={value.id}
                                sx={{
                                    p: 2,
                                    borderRadius: 'md',
                                    boxShadow: 'sm',
                                }}
                            >
                                <Radio
                                    onClick={() => Projects.setCurrentPromt(project.id, value.id)}
                                    label={`${value.description}`}
                                    overlay
                                    disableIcon
                                    checked={value.id === project.current_promt}
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
                    </RadioGroup>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                        <Typography level="h4" color="neutral">
                            Название:
                        </Typography>
                        <Input value={currentPromtDescription} onChange={e => setCurrentPromtDescription(e.target.value)} placeholder="Промт..." size="lg" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                        <Typography level="h4" color="neutral">
                            Текст промта:
                        </Typography>
                        <TextArea placeholder="..." size="lg" sx={{ minWidth: { md: 300 } }} value={currentPromtText} onChange={e => setCurrentPromtText(e.target.value)} />
                    </Box>
                    <Button onClick={() => setAddPromtDialog(true)} variant="outlined" size="lg" color="neutral" sx={{ width: '100%' }}>Добавить промт</Button>
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
                        onClick={() => { setOpenAddDialog(true); setReload(true) }}
                        startAction={
                            <Add />
                        }
                    >
                        <ListItemButton>Добавить источники</ListItemButton>
                    </ListItem>
                    {usingSources.map((element, index) => (<ListItem key={element?.id + element.title}
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
})

export default EditProject;