import mongoose from "mongoose";

const bussinessSchema = new mongoose.Schema({
    businessName: {type:String , required: true},
    businessType: { type:String, required: true},
    businessYear: { type :String , require : true},
    businessPan: { type:String , required: true},
    businessGST: { type:String , required:true },
    businessDescription: {type:String , required: true},
    businessPhone: {type:String , required: true},
    businessEmail: {type:String , required: true},
    businessCategory: {type:String , required: true},
    businessRating: {type:Number , required: true},
    businessReviews: [{type:mongoose.Schema.Types.ObjectId, ref: 'Review'}],
    businessOwnerName : {type:String , required: true },
    businessImage: {type:String , required: true},     
    businessOwnerImage : { type: String , required:true },
    businessDistrict : {type:String , required: true },
    businessCountry : { type:String , required: true},
    businessCity : {type:String , required: true },
    businessPinCode : {type:String , required: true },
    businessLocality : {type:String , required: true },
    businessAddress : {type:String , required: true },
    businessRevenue : {type:String, required:true},
    businessCurrentTurnover : { type:String , required:true},
    businessGrossProfit : { type:String , required:true },
    businessNetProfit : { type:String , required:true },
    businessGSTTurnover: { type : String , required:true },
    businessHotSelling: {type: String , required: true},
})


const businessModel  = mongoose.model.business || mongoose.model('business', bussinessSchema);
export default businessModel;
