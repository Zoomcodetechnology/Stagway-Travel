import axios from "axios";
import { baseUrl } from "../config";
const CarBookingAdminToken = localStorage.getItem("CarBookingAdminToken");

// Create an instance of axios
const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${CarBookingAdminToken}`,
  },
});

// Function to handle GET requests
export const getData = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Function to handle POST requests
export const postData = async (endpoint, data) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

// Function to handle PUT requests
export const putData = async (endpoint, data) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

// Function to handle DELETE requests
export const deleteData = async (endpoint) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};
// Function to handle image file uploads
export const ImageFileUpload = async (ImageUrl, data) => {
  try {
    const response = await api.post(ImageUrl, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};
//for both json and file type 
export const postDataWithFile = async (endpoint, jsonData, files) => {
  try {
    const formData = new FormData();
    Object.keys(jsonData).forEach((key) => {
      if (Array.isArray(jsonData[key])) {
        formData.append(key, JSON.stringify(jsonData[key]));
      } else {
        formData.append(key, jsonData[key]);
      }
    });

    Object.keys(files).forEach((key) => {
      formData.append(key, files[key]);
    });

    const response = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};
