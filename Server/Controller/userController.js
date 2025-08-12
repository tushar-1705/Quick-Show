import { clerkClient } from "@clerk/express";
import Booking from "../Models/Booking.js";
import Movie from "../Models/Movie.js";

 

// API controller function to get user bookings
export const getUserBookings = async (req , res) => {
    try {
        const user = req.auth().userId;

        const bookings = await Booking.find({user}).populate({
            path : 'show',
            populate : {path : 'movie'}
        }).sort({createdAt : -1})

        res.json({success : true , bookings})
    } catch (error) {
        console.error(error.message)
        res.json({success : false , message : error.message});
    }
}


// API controller to update favourite movie in clerk User Metadata
export const updateFavourite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);

    // Ensure favorites is always an array
    let favorites = Array.isArray(user.privateMetadata?.favorites)
      ? [...user.privateMetadata.favorites]
      : [];

    // Add or remove the movie
    if (!favorites.includes(movieId)) {
      favorites.push(movieId);
    } else {
      favorites = favorites.filter((item) => item !== movieId);
    }

    // Update Clerk privateMetadata correctly
    await clerkClient.users.updateUser(userId, {
      privateMetadata: { favorites },
    });

    res.json({ success: true, message: "Favorite Movies updated", favorites });
  } catch (error) {
    console.error("updateFavourite error:", error.message);
    res.json({ success: false, message: error.message });
  }
};



//  
export const getFavorites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId);
        const favorites = user.privateMetadata.favorites;

        // Getting movies from database
        const movies = await Movie.find({_id : {$in: favorites}})

        res.json({success : true , movies})
    } catch (error) {
        console.error(error.message)
        res.json({success : false , message : error.message});
    }
}