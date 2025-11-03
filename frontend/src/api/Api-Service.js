import axios from 'axios'

const token = sessionStorage.getItem("ACCESS_TOKEN")

const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 3600
})

if(token) apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`

export default apiClient;