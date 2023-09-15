import Box from "@mui/joy/Box";
import Textarea from '@mui/joy/Textarea';
import Stack from "@mui/joy/Stack"
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button'
import { useState } from "react";
import $api from "../../../lib/api";
import { prepareSummary } from "../ProjectPage/ProjectPage";

export default function GptChat() {
    const [gptResponse, setGptResponse] = useState('');
    const [inputValue, setInputValue] = useState('');
    const getResponseFromGpt = async () => {
        const response = await $api.post('gpt_chat/', { value: inputValue })
        setGptResponse(response.data.value)
        setInputValue('');
    }

    return <Box sx={{
        width: '94vw', height: '100%', px: { xs: 2, md: 4 },
        pt: { xs: 8, md: 4 },
        pb: { xs: 2, md: 2 }
    }}>
        <Stack sx={{
            width: '100%', height: {xs: '90vh', md: '95vh'}
        }} alignItems='center' justifyContent='space-between' direction='column'>
            <Box sx={{ width: '100%', maxHeight: '80%', overflowY: 'auto', overflowX: 'hidden' }}>
                <Typography color="neutral" level="body-sm" variant="plain" component='div'>{<div dangerouslySetInnerHTML={{ __html:prepareSummary(gptResponse)}}></div>}</Typography>
            </Box>
            <Textarea minRows={2} maxRows={8} sx={{ maxWidth: 600, width: '100%', zIndex: 100 }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                endDecorator={<Box
                    sx={{
                        position: "sticky",
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 'var(--Textarea-paddingBlock)',
                        pt: 'var(--Textarea-paddingBlock)',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        flex: 'auto',
                    }}
                >
                    <Button onClick={() => getResponseFromGpt()} sx={{
                        '&:focus': {
                            outline: 'none'
                        },
                    }}>Отправить</Button>
                </Box>} />
        </Stack>
    </Box>

}