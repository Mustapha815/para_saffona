// api/auth.js
import api from "./api";

// Login
export const login = async (email, password) => {
  const { data } = await api.post("/login", { email, password });

  return data;
  
};

// Logout
export const logout = async () => {
  const { data } = await api.post("/logout");
  return data;
};

// Get current user
export const me = async () => {
  try {
    const { data } = await api.get("/me");
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

// Register
export const fetchRegister = async (newUser) => {
  try {
    const response = await api.post("/register", newUser);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify Email
export const verifyEmail = async (verificationData) => {
  try {
    const { data } = await api.post("/verify-email", verificationData);
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
export const verifyUser = async (verificationData) => {
  try {
    const { data } = await api.post("/verify-user", verificationData);
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

// ====================
// 🔹 Forgot Password
// ====================

// Step 1: Request reset (send email)
export const forgotPassword = async (email) => {
  try {
    const { data } = await api.post("/forgot-password", { email });
    // Example response: { message: "Code sent", user_id: 123 }
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Step 2: Reset password with code
export const update_password = async (newPassData) => {
  try {
    const { data } = await api.put("/update-password", newPassData);
    // Example response: { message: "Password reset successful" }
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
export const changepassword = async (resetdata ) => {
  try {
    const { data } = await api.post("/change_password",resetdata);
    // Example response: { message: "Password reset successful" }
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
 export const update_user_info = async (profileData) => {
  try {
    const { data } = await api.put("/update-user-info", profileData);
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
}


