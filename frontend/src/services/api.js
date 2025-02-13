import axios from "axios";

const api = axios.create({
    baseURL: "https://api.minhas-financias.online/api"
});


///
export default api;
