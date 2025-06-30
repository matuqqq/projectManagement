import axios from "axios";

const URLAPI = process.env.REACT_APP_URLAPI;

export const sendPost = async (route, data = undefined, token) => {
  console.log("sendPost", route, data, token);
  console.log("URLAPI", URLAPI);
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const { data: apiResponse } = await axios.post(`${URLAPI}${route}`, data, {
      headers,
      timeout: 10000,
    });

    return apiResponse;
  } catch (error) {
    return processError(error);
  }
};

export const sendPatch = async (route, data = undefined, token) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const { data: apiResponse } = await axios.patch(`${URLAPI}${route}`, data, {
      headers,
      timeout: 10000,
    });

    return apiResponse;
  } catch (error) {
    return processError(error);
  }
};

export const sendGet = async (route, params = {}, token) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const query = new URLSearchParams(params).toString();

    const { data: apiResponse } = await axios.get(`${URLAPI}${route}?${query}`, {
      headers,
      timeout: 10000,
    });

    return apiResponse;
  } catch (error) {
    return processError(error);
  }
};

function processError(error) {
  console.error("API Error:", error);
  if (error.response && error.response.data) {
    return error.response.data;
  }
  return { success: false, message: error.message || "Error inesperado" };
}
