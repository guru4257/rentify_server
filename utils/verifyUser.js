import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';


const ObjectId = mongoose.Types.ObjectId;

export const verifyToken = async(req, res, next) => {
  const token = req.cookies.access_token;

  // if (!token) return next(errorHandler(401, 'Unauthorized'));

  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return next(errorHandler(403, 'Forbidden'));

  //   req.user = user;
  //   next();
  // });
   
  const id = new ObjectId(String(req.params.id))
  const user = await User.find_one({'_id':id})
  console.log(user)
  req.user = user;
  next()

};
