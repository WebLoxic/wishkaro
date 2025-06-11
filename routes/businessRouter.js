import express from 'express'
import { businessFetchList, businessFetchNearby, editBusinessDetails, getBusinessById, registerBusiness } from '../controllers/businessController.js';
import upload from '../middleware/upload.js';


const businessRouter = express.Router();

businessRouter.post('/register', upload.fields([
    { name: 'businessImage', maxCount: 1 },
    { name: 'businessOwnerImage', maxCount: 1 }
])  ,  registerBusiness);

businessRouter.get('/list',businessFetchList);
businessRouter.get('/nearby',businessFetchNearby);
businessRouter.get('/business/:id',getBusinessById);
businessRouter.put('/edit/:id',upload.fields([
    { name: 'businessImage', maxCount: 1 },
    { name: 'businessOwnerImage', maxCount: 1 },
  ]),editBusinessDetails);

export default businessRouter;