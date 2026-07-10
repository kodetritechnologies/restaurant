import axios from "axios";
import { cookies } from "next/headers";
export const serviceProvider = async () => {
  let token: string | undefined = undefined;
  try {
    const getCookies = await cookies();
    token = getCookies.get("adminToken")?.value;
  } catch (error) {
    // cookies() can throw during static generation
    console.warn("Cookies are not available in this context.");
  }
  function getHeaders(data: any) {
    let headers: any = {};
    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return { withCredentials: true, headers: headers };
  }

  const getMethod = async (endpoint: any) => {
    const config: any = getHeaders({});
    try {
      const response = await axios.get(
        `${process.env.base_url}/${endpoint}`,
        config,
      );
      return response?.data;
    } catch (error: any) {
      console.log("error response", error);
      return error.response.data;
    }
  };

  const postMethod = async (endpoint: any, data: any) => {
    const config = getHeaders(data);
    try {
      const response = await axios.post(
        `${process.env.base_url}/${endpoint}`,
        data,
        config,
      );
      return response.data;
    } catch (error: any) {
      return error.response.data;
    }
  };

  const patchMethod = async (endpoint: any, data: any) => {
    const config = getHeaders(data);
    try {
      const response = await axios.patch(
        `${process.env.base_url}/${endpoint}`,
        data,
        config,
      );
      return response.data;
    } catch (error: any) {
      return error.response.data;
    }
  };

  const deleteMethod = async (endpoint: any, data: any) => {
    const config = getHeaders(data);
    try {
      const response = await axios.delete(
        `${process.env.base_url}/${endpoint}`,
        config,
      );
      return response.data;
    } catch (error: any) {
      return error.response.data;
    }
  };

  return {
    getMethod,
    postMethod,
    patchMethod,
    deleteMethod,
  };
};
