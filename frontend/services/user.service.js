import axios from 'axios';
import authHeader from './auth.header';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/v1/users`;

const getAllPrivateUsers = async () => {
    const headers = await authHeader();
    return axios.get(API_URL + '/', { headers });
};

const usersService = {
    getAllPrivateUsers,
};

export default usersService;