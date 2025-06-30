import express from 'express';
import { adminLogin, allCompletedrefferals, allUser, fetchUser, getDashboardData, loginUser, refferals, registerUser, updateUser } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/fetch',fetchUser);
userRouter.get('/alluser',allUser);
userRouter.post('/adminlogin',adminLogin);
userRouter.get('/refferals',refferals);
userRouter.put('/updateuser',updateUser);
userRouter.get('/dashboard',getDashboardData);
userRouter.get('/allcompletedrefer',allCompletedrefferals);


export default userRouter;