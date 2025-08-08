import express from 'express';
import { getFavorites, getUserBookings, updateFavourite } from '../Controller/userController.js';

const userRouter = express.Router();

userRouter.get('/bookings' , getUserBookings);
userRouter.post('/update-favorite' , updateFavourite);
userRouter.get('/favorites' , getFavorites);

export default userRouter;