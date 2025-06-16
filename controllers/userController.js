import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import userModel from '../models/userModel.js';
import businessModel from '../models/businessModel.js';



const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}


// Generating Referral Code 
const generateReferralCode = async () => {
    let code;
    let exists = true;

    while (exists) {
        code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
        exists = await userModel.findOne({ sendrefferal: code });
    }

    return code;
};

// Registering User 
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, inviterefferal , pinCode  } = req.body;

        if (!name) {
            return res.json({ success: false, message: 'Name is required' });
        }
        if (!email) {
            return res.json({ success: false, message: 'Email is required' });
        }
        if (!password) {
            return res.json({ success: false, message: 'Password  is required' });
        }
        if (!phone) {
            return res.json({ success: false, message: 'Phone  is required' });
        }   
        if (!inviterefferal) {
            return res.json({ success: false, message: 'Inviterefferal  is required' });
        }   
        if (!pinCode) {
            return res.json({ success: false, message: 'Pin Code is required' });
        } 
        
        

        if (email) {
            const exists = await userModel.findOne({ email });
            if (exists) {
                return res.json({ success: false, message: 'Email already exists' });
            }
            if (!validator.isEmail(email)) {
                return res.json({ success: false, message: 'Invalid email' });
            }
        }

        if (inviterefferal) {
            const inviter = await userModel.findOne({ sendrefferal: inviterefferal });
            console.log(inviter)

            if (!inviter) {
                return res.json({ success: false, message: 'Invite referral is not valid' });
            }

            // Increment referral count
            inviter.refferalCount = (inviter.refferalCount || 0) + 1;
            

            // Save the updated inviter
            await inviter.save();
        }

        if (phone) {
            const exists = await userModel.findOne({ phone });
            if (exists) {
                return res.json({ success: false, message: 'Phone already exists' });
            }
        }

        if (password.length < 8) {
            return res.json({ success: false, message: " please enter a Strong Password " })
        }

        const salt = await bcrypt.genSalt(10);;
        const hashedPassword = await bcrypt.hash(password, salt);

        const sendrefferal = await generateReferralCode();

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            phone,
            sendrefferal ,
            inviterefferal,
            pinCode,
            referalcount: 0
        })

        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({ success: true, message: "Registration Successfully ", token });


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });

    }
}

// Logging In user 

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password)
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }
        const token = createToken(user._id);
        res.json({ success: true, message: "Login Successfully", token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}


//  fetch user 
const fetchUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Authorization token missing or malformed" });
        }

        const token = authHeader.split(' ')[1];
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        if (!decoded?.id) {
            return res.status(401).json({ success: false, message: "Login again" });
        }

        const user = await userModel.findById(decoded.id).lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User found", data: { user } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Fetch All user 

const allUser = async (req, res) => {
    try {
        const user = await userModel.find().lean();
        res.status(200).json({
            success: true, message: "User found", data:
                { user }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false, message: "Server error", error:
                error.message
        });

    }
}

// Admin Login 

const adminLogin = async (req,res) => {
  try {
    const { email, password } = req.body;
    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, message: "Login Successfully", token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// checking refferals 

const refferals = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        const user = await userModel.findById(decoded.id).lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const myCode = user.sendrefferal;

        // Find all users referred by this user
        const referredUsers = await userModel.find({ inviterefferal: myCode })
            .select("name email phone createdAt") // exclude sensitive info
            .lean();

        return res.json({
            success: true,
            totalReferred: referredUsers.length,
            referredUsers
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Updating User 

const updateUser = async (req, res) => {
  try {

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);       
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const userId = decoded.id;


    const {
      name, email, password, phone, address, pinCode,
      district, city, country, DOB, PAN, accountNumber,
      IFSC, bankName, holderName, inviterefferal
    } = req.body;

    if (!name) {
        return res.json({ success: false, message: 'Name is required' });
    }
    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }
    if (!password) {
        return res.json({ success: false, message: 'Password  is required' });
    }
    if (!phone) {
        return res.json({ success: false, message: 'Phone  is required' });
    }
    if (!address) {
        return res.json({ success: false, message: 'Address  is required' });
    }
    if (!pinCode) {
        return res.json({ success: false, message: 'Pincode is required' });
    }
    if (!city) {
        return res.json({ success: false, message: 'City is required' });
    }
    if (!district ) {
        return res.json({ success: false, message: 'District  is required' });
    }
     if (!country ) {
        return res.json({ success: false, message: 'Country  is required' });
    }
     if (!DOB) {
        return res.json({ success: false, message: 'DOB  is required' });
    }
     if (!PAN ) {
        return res.json({ success: false, message: 'PAN  is required' });
    }

    // Email format check
    if (email && !validator.isEmail(email)) {
      return res.json({ success: false, message: 'Invalid email format' });
    }

    // Hash password if updating it
    let hashedPassword;
    if (password) {
      if (password.length < 8) {
        return res.json({ success: false, message: "Password must be at least 8 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedFields = {
      name,
      email,
      ...(password && { password: hashedPassword }),
      phone,
      address,
      pinCode,
      district,
      city,
      country,
      DOB,
      PAN,
      accountNumber: accountNumber || undefined,
      IFSC: IFSC || undefined,
      bankName: bankName || undefined,
      holderName: holderName || undefined,
      inviterefferal
    };

    const updatedUser = await userModel.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Getting Dashboard Data 

const getDashboardData = async (req, res) => {
    try {
        const [
            allUsers,
            allBusinesses,
            topReferralUsers,
            topReferralBusinesses
        ] = await Promise.all([
            userModel.find(), // 1. All users
            businessModel.find(), // 2. All businesses
            userModel.find({ refferalCount: { $gte: 1000 } }), // 3. Users with 1000+ referrals
        ]);

        res.json({
            success: true,
            message: "Data fetched successfully",
            users: allUsers,
            businesses: allBusinesses,
            topReferralUsers,
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// All Completed refferals

const allCompletedrefferals = async (req, res) =>{
    try {
        const user = await userModel.find({  refferalCount: { $gte: 1000 }, })
        res.json({success:true,message:"Fetched successfully ",user});
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const FRONTEND_URL = process.env.FRONTEND_URL; // Update as needed
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success:false , message: 'User not found' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset?token=${rawToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });

    await transporter.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h3>Hello ${user.name || 'User'}</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.json({ success: true, message: 'Reset link sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({sucess:false, message: 'Something went wrong' });
  }
};





const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
   
    if (!user) return res.json({ sucess:false , message: 'Token is invalid or expired' });

    const salt = await bcrypt.genSalt(10);;
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success:true , message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.json({ success:false, message: 'Server error' });
  }
};



export {
    registerUser,
    loginUser,
    fetchUser,
    allUser,
    adminLogin,
    refferals,
    updateUser,
    getDashboardData,
    allCompletedrefferals,
    forgotPassword,
    resetPassword
}