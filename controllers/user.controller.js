import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config()

const ObjectId = mongoose.Types.ObjectId;

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user._id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account!'));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user._id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user._id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

export const getUser = async (req, res, next) => {
  try {
    
    // console.log(req.params.id)
    const id = new ObjectId(String(req.params.id))
    // console.log(id,req.params.id)
    const user = await User.findById(id);
  
    if (!user) return next(errorHandler(404, 'User not found!'));
  
    const { password: pass, ...rest } = user._doc;
  
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const sendMail = async(req,res,next) => {
  
  const { buyerEmail, buyerName, sellerEmail, propertyName, message } = req.body;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${buyerName} <${process.env.EMAIL_USER}>`, 
    to: sellerEmail, 
    subject: `Inquiry about property ${propertyName}`,
    text: `Hi,\n\nYou have a new inquiry from ${buyerName} (${buyerEmail}) regarding property ${propertyName}.\n\nMessage:\n${message}\n\nBest regards,\nRentify`,
    html: `<p>Hi,</p><p>You have a new inquiry from <strong>${buyerName}</strong> (<a href="mailto:${buyerEmail}">${buyerEmail}</a>) regarding property <strong>${propertyName}</strong>.</p><p>Message:</p><p>${message}</p><p>Best regards,<br>Rentify Website</p>`,
    replyTo: buyerEmail, 
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ success:false,error: error.message });
    }
    return res.status(200).json({ success:true,message: 'Email sent successfully', info });
  });
};
