import Booking from "../Models/Booking.js";
import Show from "../Models/Show.js";
import User from "../Models/User.js";


// API to check user is admin
export const isAdmin = async (req,res) => {
    res.json({Success : true , isAdmin : true});
}

// API to get dashboard data 
export const getDashboardData = async (req,res) => {
    try {
        const bookings = await Booking.find({isPaid : true});
        const activeShows = await Show.find({showDateTime : {$gte : new Date()}}).populate('movie');

        const totalUser = await User.countDocuments();

        const dashBoardData = {
            totalBookings : bookings.length,
            totalRevenue : bookings.reduce((acc , booking) => acc + booking.amount , 0),
            activeShows,
            totalUser
        }

        res.json({Success : true , dashBoardData})
    } catch (error) {
        console.log(error);
        res.json({Success : false , message : error.message});
    }
}

// API to get All shows
export const getAllShows = async (req,res) => {
    try {
        const shows = await Show.find({showDateTime : {$gte : new Date ()}}).populate('movie').sort({showDateTime : 1});
        res.json({Success : true , shows})
    } catch (error) {
        console.log(error);
        res.json({Success : false , message : error.message});
    }
}


// API to get all bookings
export const getAllBookings = async (req,res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path : 'show',
            populate : {path : 'movie'}
        }).sort({createdAt : -1});
        
        res.json({Success : true , bookings})
    } catch (error) {
         console.log(error);
        res.json({Success : false , message : error.message});
    }
}