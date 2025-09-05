import api from "./api";

export const getDashboardStatistics = async () => {
    try {
        const response = await api.get("/dashboard_statistic");
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        throw error;
    }
};
