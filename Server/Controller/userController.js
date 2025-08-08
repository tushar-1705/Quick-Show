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

        res.json({Success : true , bookings})
    } catch (error) {
        console.error(error.message)
        res.json({Success : false , message : error.message});
    }
}


// API controller to update favourite movie in clerk User Metadata
export const updateFavourite = async (req , res) => {
    try {
        const {movieId} = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId);

        if(!user.privateMetadata.favorites){
            user.privateMetadata.favorites = [];
        }

        if(!user.privateMetadata.favorites.includes(movieId)){
            user.privateMetadata.favorites.push(movieId)
        }else{
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId);
        }

        await clerkClient.users.updateUserMetadata(userId, {privateMetadata : user, privateMetadata})

        res.json({Success : true , message : 'Favorite Movies updated'});
    } catch (error) {
        console.error(error.message)
        res.json({Success : false , message : error.message});
    }
}


//  
export const getFavorites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId);
        const favorites = user.privateMetadata.favorites;

        // Getting movies from database
        const movies = await Movie.find({_id : {$in: favorites}})

        res.json({Success : true , movies})
    } catch (error) {
        console.error(error.message)
        res.json({Success : false , message : error.message});
    }
}