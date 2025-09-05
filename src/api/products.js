import api from "./api";
// Get current user
export const fetch_products = async () => {
  try {
    const { data } = await api.get("/products");
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
export const fetch_add_product= async (newProduct) => {
  try {
    const response = await api.post("/products",newProduct,{
            headers: {
                'Content-Type': 'multipart/form-data',
              }},);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetch_update_product= async (id,newProduct) => {
  try {
    const response = await api.post(`/products/${id}`,newProduct,{
            headers: {
                'Content-Type': 'multipart/form-data',
              }},);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};



export  const fetch_delete_product = async (IdProduct) => {
      try{
        const response = await api.delete(`/products/${IdProduct}`);
        return response.data;
      }catch (error) {
        throw error.response?.data || error;
     }

};



export const increment_product_click = async (productId) => {
  try {
    const { data } = await api.post(`/products/${productId}/click`);
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





export const fetch_sales_per_product = async () => {
  try {
    const { data } = await api.get("/sales-per-product");
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
 export const fetch_create_offer =async(offerdata)=>{  
   try {
    const response = await api.post("/offers",offerdata);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
    
  }
   export const fetch_remove_offer = async(productId)=>{  
    
   try {
    const response = await api.delete(`/offers/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
    
  }