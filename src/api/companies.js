import api from "./api";

// Fetch all companies
export const fetch_companies = async () => {
  try {
    const { data } = await api.get("/companies");
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

// Add a new company
export const fetch_add_company = async (newCompany) => {
  try {
    const response = await api.post("/companies", newCompany, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update an existing company
export const fetch_update_company = async (id, updatedCompany) => {
  try {
    const response = await api.put(`/companies/${id}`, updatedCompany, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a company
export const fetch_delete_company = async (companyId) => {
  try {
    const response = await api.delete(`/companies/${companyId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};