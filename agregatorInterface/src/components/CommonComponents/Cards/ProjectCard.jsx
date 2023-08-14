import Card from "@mui/joy/Card"
import Stack from "@mui/joy/Stack"
import Typography from "@mui/joy/Typography"
import IconButton from "@mui/joy/IconButton"
import {Link} from "react-router-dom"
import CardActions from "@mui/joy/CardActions"
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import Projects from "../../../store/Projects"

function ButtonGroup({ liked, id, handleDelete }) {
    return <Stack spacing={1}
        direction={{ xs: 'column', md: 'row'}}
        flex={1}
        justifyContent="flex-end"
        alignItems="center">
        <IconButton size="md" component={Link} to={`projects/edit/${id}`}>
            <EditIcon />
        </IconButton>
        <IconButton size="md" onClick={() => Projects.deleteProjectById(id)}>
            <CloseIcon/>
        </IconButton>
    </Stack>
}

export default function ProjectCard({id, title, description, liked = false, category }) {
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
            },
        }}>
        <Stack sx={{ padding: { xs: 2, sm: 0 }, overflow: 'hidden'}} spacing={1} flex={1} component={Link} to={`projects/${id}`}>
            <Stack spacing={1} direction='row' justifyContent='space-between' alignItems='center'>
                <div>
                    <Typography color="primary" fontSize='sm' fontWeight='lg'>
                        {category}
                    </Typography>
                    <Typography fontWeight="title-md" level="h3" fontStyle="lg">
                        {title}
                    </Typography>
                </div>
            </Stack>
            <Typography  color="neutral" level="body-sm" variant="plain">
                {description.length <= 200 ? description : (description.substr(0, 200) + '...')}
            </Typography>
        </Stack>
        <CardActions sx={{mr: 2, my: 2}}>
            <ButtonGroup id={id}/>
        </CardActions>
    </Card>
}