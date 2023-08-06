import Card from "@mui/joy/Card"
import Divider from '@mui/joy/Divider'
import Typography from "@mui/joy/Typography"
import IconButton from "@mui/joy/IconButton"
import CardContent from "@mui/joy/CardContent"
import Stack from "@mui/joy/Stack"
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import CardActions from "@mui/joy/CardActions"

export default function TimeSummaryCard({ summary }) {
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
        <Stack orientation="column" spacing={2} sx={{ padding: { xs: 2, sm: 0 }, pt: {xs: 0, sm: 0}}} flex={1}>
            <Stack direction="row" spacing={1.5} alignItems="flex-end" justifyContent="space-between" >
                <Stack direction="row" spacing={2}>
                    <Typography fontWeight="title-md" level="h5" fontStyle="lg">
                        С: {summary.timeStart}-{summary.timeEnd}
                    </Typography>
                    <Typography fontWeight="title-md" level="h5" fontStyle="lg" sx={{ ml: 2 }}>
                        {summary.date}
                    </Typography>
                </Stack>
                <CardActions>
                    <IconButton size="md">
                        <EditIcon />
                    </IconButton>
                    <IconButton size="md" >
                        <CloseIcon />
                    </IconButton>
                </CardActions>
            </Stack>
            <Divider />
            <CardContent>
                <Typography  color="neutral" level="body-md" variant="plain">
                    {summary.summary}
                </Typography>
            </CardContent>
        </Stack>
    </Card>
}