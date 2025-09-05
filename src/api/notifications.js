import api from "./api";
export const fetch_notifications = async () => {
  try {
    const { data } = await api.get("/notifications");
    return data;
  } catch (err) {
    if (err.response) {
      console.error("Server error:", err.response.data);
      throw new Error(
        err.response.data.message || JSON.stringify(err.response.data)
      );
    }
    console.error("Network error:", err);
    throw err;
  }
};




export const fetch_update_notification = async (id) => {
  try {
    const response = await api.put(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export  const fetch_delete_notification = async (IdNotification) => {
      try{
        const response = await api.delete(`/notifications/${IdNotification}`);
        return response.data;
      }catch (error) {
        throw error.response?.data || error;
     }

};
