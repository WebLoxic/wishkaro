import express from 'express';
import { adminLogin, allCompletedrefferals, allUser, fetchUser, forgotPassword, getDashboardData, loginUser, refferals, registerUser, resetPassword, updateUser } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/forgot',forgotPassword);
userRouter.post('/reset',resetPassword);
userRouter.get('/fetch',fetchUser);
userRouter.get('/alluser',allUser);
userRouter.post('/adminlogin',adminLogin);
userRouter.get('/refferals',refferals);
userRouter.put('/updateuser',updateUser);
userRouter.get('/dashboard',getDashboardData);
userRouter.get('/allcompletedrefer',allCompletedrefferals);


export default userRouter;