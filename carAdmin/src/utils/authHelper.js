

export const getAuthHeader = () => {
    const token = localStorage.getItem("tokenData");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    } else {
      return {};
    }
  };
  