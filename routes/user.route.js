import express from 'express';
import { deleteUser, test, updateUser,  getUserListings, getUser, sendMail} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';


const router = express.Router();

router.get('/test', test);
router.post('/update/:id', verifyToken, updateUser)
router.delete('/delete/:id', verifyToken, deleteUser)
router.get('/listings/:id', verifyToken,getUserListings)
router.get('/getDetails/:id', verifyToken, getUser)
router.post('/sendEmail/',verifyToken,sendMail)

export default router;