const FareDetailsModel = require("../model/fareDetailsModel");
const Helper = require("../utils/helper");
//for creating fareDetails as like seeder
const createFareDetails = async (req, res) => {
  try {
    const { fareDetails } = req.body;
    if (!fareDetails) {
      return Helper.fail(res, "fareDetails is required!");
    }
    let fareDetail = await FareDetailsModel.findOne({ fareDetails });
    if (fareDetail) return Helper.fail(res, "fareDetails Already Exist");
    let cityObj = {
      fareDetails,
    };
    let createFareDetails = await FareDetailsModel.create(cityObj);
    return Helper.success(res, "FareDetails created successfully!", createFareDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
//for updating FareDetails
const updateFareDetails = async (req, res) => {
  try {
    const { fareDetailsId, fareDetails } = req.body;
    if (!fareDetailsId) {
      return Helper.fail(res, "fareDetailsId is missing from request");
    }
    if (!fareDetails) {
      return Helper.fail(res, "fareDetails is required");
    }
    //checking city exist or not
    let fareDetail = await FareDetailsModel.findById({ _id: fareDetailsId, isDeleted: false });
    if (!fareDetail) {
      return Helper.fail(res, "fareDetail not found!");
    }
    let objToUpdate = {};
    if (fareDetails) {
      objToUpdate.fareDetails = fareDetails;
    }

    let updateFareDetails = await FareDetailsModel.findByIdAndUpdate(fareDetailsId, objToUpdate, {
      new: true,
    });
    if (updateFareDetails) {
      return Helper.success(res, "FareDetails  updated successfully!", updateFareDetails);
    }
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
//for get All faredetails
const getAllFareDetails = async (req, res) => {
  try {
    const fareDetails = await FareDetailsModel.find({ isDeleted: false });
    if (fareDetails.length > 0) {
      return Helper.success(res, "fareDetails Found Successfully", fareDetails);
    } else {
      return Helper.success(res, "No fareDetails Found", []);
    }
  } catch (error) {
    console.error(error);
    return Helper.error(res, " Error Found in fetching fareDetails");
  }
};
module.exports = {
    createFareDetails,
    updateFareDetails,
    getAllFareDetails,
}