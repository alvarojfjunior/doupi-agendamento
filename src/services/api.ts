import axios from "axios";

export const getAxiosInstance = (user?: any) => {
  //const url = process.env.NEXT_PUBLIC_API_URL;
  const url = '';
  try {
    if (user) {
      return axios.create({
        baseURL: url,
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
    } else {
      return axios.create({
        baseURL: url,
      });
    }
  } catch (error) {
    return axios.create({
      baseURL: url,
    });
  }
};