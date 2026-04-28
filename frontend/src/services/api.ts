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

export const uploadFile = async (fileUri: string, fileName: string) => {
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'application/octet-stream',
    });

    // O controller do NestJS usa /files
    const response = await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    // Monta a URL completa usando o PATH retornado pelo backend
    const serverUrl = 'http://10.0.2.2:3000';
    const filePath = response.data.path.startsWith('/') ? response.data.path : `/${response.data.path}`;
    
    return `${serverUrl}${filePath}`; 
};

export default api