import api from "./api";
export const fetch_categories = async () => {
  try {
    const { data } = await api.get("/categories");
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

export const fetch_add_categorie = async (newCategory) => {
  try {
    const response = await api.post("/categories",newCategory,{
            headers: {
                'Content-Type': 'multipart/form-data',
              }},);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const fetch_update_categorie = async (id,newCategory) => {
  try {
    const response = await api.post(`/categories/${id}`,newCategory,{
            headers: {
                'Content-Type': 'multipart/form-data',
              }},);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export  const fetch_delete_categorie = async (IdCategory) => {
      try{
        const response = await api.delete(`/categories/${IdCategory}`);
        return response.data;
      }catch (error) {
        throw error.response?.data || error;
     }

};
export const fetch_sales_per_categories = async () => {
  try {
    const { data } = await api.get("/sales-per-categories");
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