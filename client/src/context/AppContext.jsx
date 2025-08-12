import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoritesMovies, setFavoritesMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Create axios instance
  const axiosInstance = axios.create({
    baseURL
  });

  // Automatically attach token to every request
  axiosInstance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const fetchIsAdmin = async () => {
    try {
      const res = await axiosInstance.get(`/api/admin/is-admin`);
      const data = res.data;
      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        toast.error("You are not authorized to access admin dashboard");
        navigate("/");
      }
    } catch (error) {
      console.error("fetchIsAdmin error:", error?.response?.data || error.message);
      if (location.pathname.startsWith("/admin")) {
        toast.error("Error checking admin status");
        navigate("/");
      }
    }
  };

  const fetchShows = async () => {
    try {
      const res = await axiosInstance.get(`/api/show/all`);
      const data = res.data;

      console.log("Fetched Shows:", data);

      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message || "Failed to fetch shows");
      }
    } catch (error) {
      console.error("fetchShows error:", error?.response?.data || error.message);
      toast.error("Failed to fetch shows");
    }
  };

  const fetchFavoriteMovies = async () => {
    try {
      const res = await axiosInstance.get(`/api/user/favorites`);
      const data = res.data;

      if (data.success) {
        setFavoritesMovies(data.movies);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("fetchFavoriteMovies error:", error?.response?.data || error.message);
      toast.error("Failed to fetch favorite movies");
    }
  };

  useEffect(() => {
    fetchShows();
    fetchFavoriteMovies();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (user) {
        await fetchIsAdmin();
      }
    };
    load();
  }, [user]);

  const value = {
    axios: axiosInstance, // always returns axios with token attached
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    favoritesMovies,
    baseURL,
    fetchShows,
    fetchFavoriteMovies,
    image_base_url
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => useContext(AppContext);

export { baseURL, AppContext, AppProvider, useAppContext };
