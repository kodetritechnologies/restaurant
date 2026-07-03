import axios from "axios";
import Cookies from "js-cookie";

export default function BasicProvider() {
  function getHeaders(data: any, endpoint?: string) {
    const adminToken = Cookies.get("adminToken");
    let headers: any = {};
    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
    }

    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }

    return { withCredentials: true, headers: headers };
  }

  const getMethod = async (endpoint: any) => {
    const config = getHeaders({}, endpoint);
    try {
      const response = await axios.get(`${endpoint}`, config);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: error.message };
    }
  };

  const postMethod = async (endpoint: any, data: any) => {
    const config = getHeaders(data, endpoint);
    try {
      const response = await axios.post(`${endpoint}`, data, config);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: error.message };
    }
  };

  const patchMethod = async (endpoint: any, data: any) => {
    const config = getHeaders(data, endpoint);
    try {
      const response = await axios.patch(`${endpoint}`, data, config);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: error.message };
    }
  };

  const putMethod = async (endpoint: any, data: any) => {
    const config = getHeaders(data, endpoint);
    try {
      const response = await axios.put(`${endpoint}`, data, config);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: error.message };
    }
  };

  const deleteMethod = async (endpoint: any, data?: any) => {
    const config = getHeaders(data, endpoint);
    try {
      const response = await axios.delete(`${endpoint}`, config);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: error.message };
    }
  };

  return {
    getMethod,
    postMethod,
    putMethod,
    patchMethod,
    deleteMethod,
  };
}
