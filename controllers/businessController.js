import businessModel from '../models/businessModel.js';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
// import BusinessModel from '../models/businessModel.js';

const registerBusiness = async (req, res) => {
    try {
        const {
            businessName,
            businessType,
            businessYear,
            businessPan,
            businessGST,
            businessDescription,
            businessPhone,
            businessEmail,
            businessCategory,
            businessRating,
            businessOwnerName,
            businessDistrict,
            businessCountry,
            businessCity,
            businessPinCode,
            businessLocality,
            businessAddress,
            businessRevenue,
            businessCurrentTurnover,
            businessGrossProfit,
            businessNetProfit,
            businessGSTTurnover,
            businessHotSelling,
        } = req.body;

        const businessImage = req.files?.['businessImage']?.[0]?.path.replace(/\\/g, "/");
        const businessOwnerImage = req.files?.['businessOwnerImage']?.[0]?.path.replace(/\\/g, "/");

        // === Validations ===
        if (!businessName) return res.status(400).json({ error: 'Business name is required' });
        if (!businessType) return res.status(400).json({ error: 'Business type is required' });
        if (!businessYear) return res.status(400).json({ error: 'Business established year is required' });
        if (!businessPan) return res.status(400).json({ error: 'Business PAN is required' });
        if (!businessGST) return res.status(400).json({ error: 'Business GST is required' });
        if (!businessDescription) return res.status(400).json({ error: 'Business description is required' });
        if (!businessPhone) return res.status(400).json({ error: 'Business phone is required' });
        if (!businessEmail) return res.status(400).json({ error: 'Business email is required' });
        if (!businessCategory) return res.status(400).json({ error: 'Business category is required' });
        if (businessRating === undefined || businessRating === null) return res.status(400).json({ error: 'Business rating is required' });
        if (isNaN(businessRating) || businessRating < 0 || businessRating > 5) {
            return res.status(400).json({ error: 'Business rating must be a number between 0 and 5' });
        }
        if (!businessOwnerName) return res.status(400).json({ error: 'Business owner name is required' });
        if (!businessDistrict) return res.status(400).json({ error: 'Business district is required' });
        if (!businessCountry) return res.status(400).json({ error: 'Business country is required' });
        if (!businessCity) return res.status(400).json({ error: 'Business city is required' });
        if (!businessPinCode) return res.status(400).json({ error: 'Business pin code is required' });
        if (!businessLocality) return res.status(400).json({ error: 'Business locality is required' });
        if (!businessAddress) return res.status(400).json({ error: 'Business address is required' });
        if (!businessRevenue) return res.status(400).json({ error: 'Business revenue is required' });
        if (!businessCurrentTurnover) return res.status(400).json({ error: 'Current turnover is required' });
        if (!businessGrossProfit) return res.status(400).json({ error: 'Gross profit is required' });
        if (!businessNetProfit) return res.status(400).json({ error: 'Net profit is required' });
        if (!businessGSTTurnover) return res.status(400).json({ error: 'GST turnover is required' });
        if (!businessHotSelling) return res.status(400).json({ error: 'Hot selling item is required' });
        if (!businessImage) return res.status(400).json({ error: 'Business image is required' });
        if (!businessOwnerImage) return res.status(400).json({ error: 'Business owner image is required' });

        // === Save to DB ===
        const newBusiness = new businessModel({
            businessName,
            businessType,
            businessYear,
            businessPan,
            businessGST,
            businessDescription,
            businessPhone,
            businessEmail,
            businessCategory,
            businessRating,
            businessReviews: [],
            businessOwnerName,
            businessImage,
            businessOwnerImage,
            businessDistrict,
            businessCountry,
            businessCity,
            businessPinCode,
            businessLocality,
            businessAddress,
            businessRevenue,
            businessCurrentTurnover,
            businessGrossProfit,
            businessNetProfit,
            businessGSTTurnover,
            businessHotSelling,
        });

        const savedBusiness = await newBusiness.save();
        res.status(201).json({
            message: 'Business registered successfully',
            data: savedBusiness,
        });
    } catch (error) {
        console.error('Register Business Error:', error);
        res.status(500).json({ error: 'Something went wrong while registering the business' });
    }
};



const businessFetchList = async (req, res) => {
  try {
    const businesses = await businessModel.find();
    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


const businessFetchNearby = async (req, res) => {
  try {
    // 1. Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing or invalid" });
    }

    // 2. Get token from header
    const token = authHeader.split(" ")[1];

    // 3. Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    // 4. Fetch user
    const user = await userModel.findById(userId);
    if (!user || !user.pinCode) {
      return res.status(404).json({ message: "User not found or pinCode missing" });
    }

    const userPincode = parseInt(user.pinCode); // assuming pinCode is stored as string

    console.log(userPincode)

    // 5. Find nearby pincodes
    const nearbyPincodes = [userPincode - 1, userPincode, userPincode + 1].map(String);

    console.log("Querying businesses with pincodes:", nearbyPincodes);

    // 6. Query businesses
    const businesses = await businessModel.find({
      businessPinCode: { $in: nearbyPincodes }
    });

    // 7. Send response
    return res.status(200).json({
      success: true,
      message: "Nearby businesses fetched successfully",
      data: businesses
    });

  } catch (error) {
    console.error("Error in businessFetchNearby:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};


const getBusinessById = async (req, res) => {
  try {
    const businessId = req.params.id;

    if (!businessId) {
      return res.status(400).json({ message: "Business ID is required" });
    }

    const business = await businessModel.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Business fetched successfully",
      data: business,
    });

  } catch (error) {
    console.error("Error in getBusinessById:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


const editBusinessDetails = async (req, res) => {
  const businessId = req.params.id;

  // Destructure the expected fields from req.body
  const {
    businessName,
    businessDescription,
    businessPhone,
    businessEmail,
    businessCategory,
    businessRating,
    businessOwnerName,
    businessState,
    businessCity,
    businessPinCode,
    businessLocality,
    businessAddress,
    businessRevenue,
  } = req.body;

  try {
    // Find the business by ID
    const business = await businessModel.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Update only the fields provided
    if (businessName !== undefined) business.businessName = businessName;
    if (businessDescription !== undefined) business.businessDescription = businessDescription;
    if (businessPhone !== undefined) business.businessPhone = businessPhone;
    if (businessEmail !== undefined) business.businessEmail = businessEmail;
    if (businessCategory !== undefined) business.businessCategory = businessCategory;
    if (businessRating !== undefined) business.businessRating = businessRating;
    if (businessOwnerName !== undefined) business.businessOwnerName = businessOwnerName;
    if (businessState !== undefined) business.businessState = businessState;
    if (businessCity !== undefined) business.businessCity = businessCity;
    if (businessPinCode !== undefined) business.businessPinCode = businessPinCode;
    if (businessLocality !== undefined) business.businessLocality = businessLocality;
    if (businessAddress !== undefined) business.businessAddress = businessAddress;
    if (businessRevenue !== undefined) business.businessRevenue = businessRevenue;

    // ✅ Handle image uploads
    if (req.files?.businessImage?.[0]) {
      business.businessImage = req.files.businessImage[0].path; // or filename if you're storing that
    }

    if (req.files?.businessOwnerImage?.[0]) {
      business.businessOwnerImage = req.files.businessOwnerImage[0].path;
    }

    // Save the updated business document
    const updatedBusiness = await business.save();

    res.status(200).json({
      message: 'Business updated successfully',
      business: updatedBusiness,
    });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export {
    registerBusiness,
    businessFetchList,
    businessFetchNearby,
    getBusinessById,
    editBusinessDetails,
}