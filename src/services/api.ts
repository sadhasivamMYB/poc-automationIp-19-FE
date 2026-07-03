import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Optionally dispatch a custom event to tell AuthContext to logout
            window.dispatchEvent(new Event("auth-error"));
        }
        
        const message = error.response?.data?.message || "An unexpected error occurred";
        toast.error(message);
        
        return Promise.reject(error);
    }
);

export default api;