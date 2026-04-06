import { storage } from '@/utils/storage'
import axios from 'axios'
import { Platform } from 'react-native'

const api = axios.create({
    baseURL: Platform.OS === 'android' ? 'http://10.0.2.2:3000/ProDeskApi' : 'http://localhost:3000/ProDeskApi'
})

api.interceptors.request.use(async (config) => {
    const token = await storage.getItem('prodesk_token') 

    if (token) {
        config.headers.Authorization =  `Bearer ${token}`
    } 

    return config
})

export default api