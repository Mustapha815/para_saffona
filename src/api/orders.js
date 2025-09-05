import api from "./api";
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};
export const fetch_orders = async () => {
  try {
    const { data } = await api.get("/orders");
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
export const fetchingUpdateOrderStatus = async (orderId, updatedData) => {
  try {
    const response = await api.patch(`/orders/${orderId}`, updatedData, {
      
    });
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const fetchUserOrders = async () => {

  try {
    const response = await api.get('/userorders', {
    
    });
   
    return response.data.orders || response.data;
    
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};