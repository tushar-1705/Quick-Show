import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlurCircle from "../Components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import TimeFormat from "../Lib/TimeFormat";
import DateSelect from "../Components/DateSelect";
import MovieCard from "../Components/MovieCard";
import Loading from "../Components/Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // show will be { movie: {...}, dateTime: {...} }
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    shows, 
    axios, 
    getToken, 
    user,
    fetchFavoriteMovies,
    favoritesMovies,
    image_base_url,
  } = useAppContext();

  // GET single show (movie + dateTime)
  const getShow = async () => {
    try {
      setLoading(true);
      // using axios from context; adjust path if you use baseURL differently
      const res = await axios.get(`/api/show/${id}`);
      console.log("getShow response:", res.data);

      if (res.data && res.data.success) {
        // API returns { success:true, movie: {...}, dateTime: {...} }
        setShow({
          movie: res.data.movie || res.data.show || null,
          dateTime: res.data.dateTime || {},
        });
      } else {
        toast.error(res.data?.message || "Failed to load movie details");
        setShow(null);
      }
    } catch (err) {
      console.error("getShow error:", err?.response?.data || err.message);
      toast.error("Failed to load movie details");
      setShow(null);
    } finally {
      setLoading(false);
    }
  };

  // Favorite/unfavorite (use POST for updates)
  const handleFavorite = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");

      const token = await getToken();
      if (!token) return toast.error("Not authenticated");

      // Use POST with JSON body (your backend should accept this)
      const res = await axios.post(
        "/api/user/update-favorite",
        { movieId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("update-favorite response:", res.data);

      if (res.data?.success) {
        toast.success(res.data.message || "Updated favorites");
        // optionally refetch favorites
        if (fetchFavoriteMovies) fetchFavoriteMovies();
      } else {
        toast.error(res.data?.message || "Failed to update favorites");
      }
    } catch (err) {
      console.error(
        "handleFavorite error:",
        err?.response?.data || err.message
      );
      toast.error("Failed to update favorites");
    }
  };

  useEffect(() => {
  if (id) getShow();

  // also ensure we have the shows list for recommendations
  if (!Array.isArray(shows) || shows.length === 0) {
    (async () => {
      try {
        const res = await axios.get("/api/show");
        if (res.data?.success && Array.isArray(res.data.shows)) {
          // you might have a setter in context for shows
          // e.g., setShows(res.data.shows);
        }
      } catch (err) {
        console.error("Failed to fetch shows:", err);
      }
    })();
  }
}, [id]);


  if (loading) return <Loading />;

  // If no show data
  if (!show || !show.movie) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No movie data available.</p>
      </div>
    );
  }

  const movie = show.movie;

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={
            movie.poster_path
              ? image_base_url
                ? image_base_url + movie.poster_path
                : movie.poster_path
              : "https://via.placeholder.com/400x600?text=No+Poster"
          }
          alt={movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          <p className="text-primary">ENGLISH</p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {typeof movie.vote_average === "number"
              ? movie.vote_average.toFixed(1)
              : "N/A"}{" "}
            User Rating
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {movie.overview}
          </p>

          <p>
            {movie.runtime ? TimeFormat(movie.runtime) : "—"} .{" "}
            {movie.genres?.map((g) => g.name).join(", ") ?? "—"} .{" "}
            {movie.release_date ? movie.release_date.split("-")[0] : "—"}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="w-5 h-5" /> Watch Trailer
            </button>

            <a
              href="#dateselect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>

            <button
              onClick={handleFavorite}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart
                className={`w-5 h-5 ${
                  favoritesMovies?.find((m) => m._id === id)
                    ? "fill-primary text-primary"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <p className="text-lg font-medium mt-20">Your Favourite Cast</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {(movie.casts ?? []).slice(0, 12).map((cast, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <img
                src={
                  cast.profile_path
                    ? image_base_url
                      ? image_base_url + cast.profile_path
                      : cast.profile_path
                    : "https://via.placeholder.com/100x100?text=No+Image"
                }
                alt={cast.name}
                className="rounded-full h-20 md:h-20 aspect-square object-cover"
              />
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <DateSelect datetime={show.dateTime} id={id} />

      <p className="text-lg font-medium mt-20 mb-8">You May also Like</p>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {Array.isArray(shows) && shows.length > 0 ? (
    [
      ...new Map(
        shows
          .filter((s) => s?.movie && s.movie._id)
          .map((s) => [s.movie._id, s.movie])
      ).values(),
    ]
      .filter((m) => m._id !== movie._id)
      .slice(0, 3)
      .map((m, idx) => <MovieCard key={m._id ?? idx} movie={m} />)
  ) : (
    <p className="text-gray-400">No recommendations available.</p>
  )}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => navigate("/movies")}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show More
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;
