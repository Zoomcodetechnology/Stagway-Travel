const UserModel = require('../model/userModel');
const BookingModel = require('../model/bookingModel');
const Helper = require('../utils/helper');

const getAdminAnalytics = async (req, res) => {
    try {
        const [totalUsers, totalRevenue] = await Promise.all([
            UserModel.countDocuments({ isDeleted: false }),
            UserModel.countDocuments({ 
                isDeleted: false, 
                number: { $ne: null }  
            }),
            BookingModel.aggregate([
                { 
                    $match: { 
                        paymentStatus: "Paid", 
                        isDeleted: false 
                    } 
                },
                { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } } 
            ])
        ]);
        return Helper.success(res, "Admin analytics fetched successfully!", {data:{
                totalUsers,
                totalRevenue: totalRevenue[0]?.totalRevenue || 0  
            }});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong!" });
    }
};

module.exports = { getAdminAnalytics };
