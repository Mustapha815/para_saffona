import api from "./api";

export const getFavorites = async () => {
  const response = await api.get("/favourites");
  return response.data;
};

export const toggle_favorite = async (formData) => {
  try {
    const { data } = await api.post(`/favourites/toggle`, formData);
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
