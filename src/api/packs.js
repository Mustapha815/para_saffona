import api from "./api";

// Fetch all packs
export const fetch_packs = async () => {
  try {
    const { data } = await api.get("/packs");
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

// Fetch a single pack by ID
export const fetch_pack = async (packId) => {
  try {
    const { data } = await api.get(`/packs/${packId}`);
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

// Create a new pack
export const create_pack = async (packData) => {
  try {
    const { data } = await api.post("/packs", packData);
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

// Update an existing pack
export const update_pack = async (packData) => {
  try {
    const { data } = await api.put(`/packs/${packData.id}`, packData);
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

// Delete a pack
export const delete_pack = async (packId) => {
  try {
    const { data } = await api.delete(`/packs/${packId}`);
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



export const increment_pack_click = async (packId) => {
  try {
    const { data } = await api.post(`/packs/${packId}/click`);
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