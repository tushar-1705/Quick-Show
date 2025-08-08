// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { useAuth, useUser } from "@clerk/clerk-react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { toast } from "react-hot-toast";

// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
// const AppContext = createContext();

// const AppProvider = ({ children }) => {
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [shows, setShows] = useState([]);
//   const [favoritesMovies, setFavoritesMovies] = useState([]);

//   const { user } = useUser();
//   const { getToken } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const fetchIsAdmin = async () => {
//     try {
//       const { data } = await axios.get("/api/admin/is-admin", {
//         headers: { Authorization: `Bearer ${await getToken()}` },
//       });
//       setIsAdmin(data.isAdmin);

//       if (!data.isAdmin && location.pathname.startsWith("/admin")) {
//         toast.error("You are not authorized to access admin dashboard");
//         navigate("/");
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fetchShows = async () => {
//     try {
//       const data = await axios.get("/api/show/all");
//       if (data.success) {
//         setShows(data.shows);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       // toast.error("something went wrong")
//       console.error(error);
//     }
//   };

  // const fetchFavoriteMovies = async () => {
  //   try {
  //     const data = await axios.get("/api/user/favorites", {
  //       headers: { Authorization: `Bearer ${await getToken()}` },
  //     });

  //     if (data.success) {
  //       setFavoritesMovies(data.movies);
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

//   useEffect(() => {
//     fetchShows();
//   }, []);

//   useEffect(() => {
//     const initialize = async () => {
//       if (user && getToken) {
//         await fetchIsAdmin();
//         await fetchFavoriteMovies();
//       }
//     };

//     initialize();
//   }, [user, getToken]);

//   const value = {
//     axios,
//     fetchIsAdmin,
//     user,
//     getToken,
//     navigate,
//     isAdmin,
//     shows,
//     favoritesMovies,
//     fetchFavoriteMovies,
//   };
//   return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
// };

// const useAppContext = () => {
//    return useContext(AppContext);
// }

// export { AppProvider, AppContext, useAppContext };

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

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    try {
      const token = await getToken();
      console.log(token)
      if (!token) return;

      const res = await axios.get(`${baseURL}/api/admin/is-admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      const res = await axios.get(`${baseURL}/api/show/all`);
      const data = res.data;

      console.log("Fetched Shows:", data);

      if (data.Success) {
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
      const res = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

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
  }, []);

  useEffect(() => {
    const load = async () => {
      if (user) {
        await fetchIsAdmin();
        // await fetchFavoriteMovies(); 
      }
    };

    load();
  }, [user]);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    favoritesMovies,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => useContext(AppContext);

export {baseURL, AppContext, AppProvider, useAppContext}
