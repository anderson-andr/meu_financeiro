import axios from "axios";

const api = axios.create({
    baseURL: "http://3.139.109.36:3000/api"
});

export default api;
