import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{ type: String, required: true},
    email:{ type: String, required: true, unique: true},
    password:{ type: String, required: true},
    phone: {  type: String, required: true },
    address: { type: String},
    pinCode : { type: String},
    district : {type: String},
    city: { type: String},
    country : { type:String  },
    DOB : { type: Date },
    PAN : { type: String  },
    accountNumber : {type : String  },
    IFSC : { type: String  },
    bankName : { type: String  },
    holderName : { type: String  },
    sendrefferal : { type: String , required : true  },
    inviterefferal : { type: String , required: true },
    refferalCount: { type: Number, default: 0 }

})

const userModel = mongoose.models.user || mongoose.model('user', userSchema );

export default userModel;
