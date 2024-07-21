import axios from "axios";
import router from "./router";

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    withCredentials: true,
    withXSRFToken: true,
});

axiosClient.interceptors.request.use(async (config) => {
    if (!axiosClient.defaults.headers.common["X-CSRF-TOKEN"]) {
        try {
            const response = await axios.get("/api/csrf-token");
            const csrfToken = response.data.csrf_token;
            axiosClient.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
        } catch (error) {
            console.error("Failed to fetch CSRF token:", error);
        }
    }

    const token = localStorage.getItem("TOKEN");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            router.navigate("/login");
            return error;
        }

        throw error;
    }
);

export default axiosClient;
