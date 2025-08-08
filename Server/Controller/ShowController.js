import axios from 'axios';
import dns from 'dns';
import Movie from '../Models/Movie.js';
import Show from '../Models/Show.js';

// Force IPv4 (optional, helps avoid ECONNRESET on some networks)
dns.setDefaultResultOrder('ipv4first');

// ✅ Retry helper
const fetchWithRetry = async (url, options, retries = 3) => {
  while (retries > 0) {
    try {
      return await axios.get(url, options);
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      console.warn(`Retrying TMDB request... (${3 - retries}/3)`);
      await new Promise(res => setTimeout(res, 1000)); // Wait 1 second before retry
    }
  }
};

// 🎬 Get now playing movies
export const getNowPlayingMovies = async (req, res) => {
  try {
    const response = await fetchWithRetry(
      `https://api.themoviedb.org/3/movie/now_playing`,
      {
        params: { api_key: process.env.TMDB_API_KEY },
        timeout: 15000,
        family: 4,
      }
    );

    res.json({ success: true, movies: response.data.results });
  } catch (error) {
    console.error('TMDB API error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🍿 Add show
export const addShow = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, message: 'Request body is missing or invalid' });
    }

    console.log("Received request body:", req.body);

    const { movieId, showsInput, showPrice } = req.body;

    if (!movieId || !showsInput || !showPrice) {
      return res.status(400).json({ success: false, message: 'movieId, showsInput and showPrice are required' });
    }

    let movie = await Movie.findById(movieId);

    if (!movie) {
      const [movieDetailsResponse, movieCreditResponse] = await Promise.all([
        fetchWithRetry(`https://api.themoviedb.org/3/movie/${movieId}`, {
          params: { api_key: process.env.TMDB_API_KEY },
          timeout: 10000,
          family: 4
        }),
        fetchWithRetry(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          params: { api_key: process.env.TMDB_API_KEY },
          timeout: 10000,
          family: 4
        })
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || '',
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: 'Show Added Successfully.' });

  } catch (error) {
    console.error('TMDB API error:', error.message);
    res.json({ success: false, message: error.message });
  }
};


// API to get all shows from the database
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({})
      .populate('movie')
      .sort({ showDateTime: 1 });

    res.json({ Success: true, shows });
  } catch (error) {
    console.error("Error fetching shows:", error.message);
    res.status(500).json({ Success: false, message: error.message });
  }
};


// API to get single show from the database
export const getShow = async (req, res) => {
  try {
    const {movieId} = req.params;
    // get all upcoming shows for movie
    const shows = await Show.find({movie: movieId, showDateTime: {$gte: new Date()}})

    const movie = await Movie.findById(movieId);
    const dateTime = {}

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split('T')[0];
      if(!dateTime[date]){
        dateTime[date] = []
      }
      dateTime[date].push({time: show.showDateTime, showId : show._id})
    })
    res.json({Success : true, movie, dateTime})
  } catch (error) {
    console.error(error);
    res.json({Success : false , message : error.message})
  }
}