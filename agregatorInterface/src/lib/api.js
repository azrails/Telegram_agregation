import axios from 'axios'

const $api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    crossorigin: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

export default $api;