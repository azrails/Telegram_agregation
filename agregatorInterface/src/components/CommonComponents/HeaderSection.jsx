import Stack from "@mui/joy/Stack"
import Typography from "@mui/joy/Typography"
import Button from "@mui/joy/Button"
import { Link } from "react-router-dom"

export default function HeaderSection() {
    return <Stack
        direction={{
            xs: 'column',
            sm: 'row'
        }}
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
    >
        <div>
            <Typography
                level="h1"
                fontSize={{ xs: 'xl2', md: 'xl4' }}
                fontWeight='md'
                fontStyle='lg'
            >
                Текущие проекты
            </Typography>
        </div>
        <Stack direction="row" spacing={1.5}>
            <Button color="neutral" variant="outlined" component={Link} to={`projects/create`}>Добавить проект</Button>
        </Stack>
    </Stack>
}