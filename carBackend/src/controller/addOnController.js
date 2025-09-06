const AddOnModel = require("../model/addOnModel");
const Helper = require("../utils/helper");
//for creating new AddOn
const addOnRegister = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name) {
      return Helper.fail(res, "name is required!");
    }
    if (!price) {
      return Helper.fail(res, "price is required!");
    }
    let addOnCheck = await AddOnModel.findOne({ name });
    if (addOnCheck) return Helper.fail(res, "addOn Already Exist");
    let addOnObj = {
      name,
      price,
    };
    let createAddOn = await AddOnModel.create(addOnObj);
    return Helper.success(res, "AddOn created successfully!", createAddOn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// for getting All AddOns
const findAllAddOns = async (req, res) => {
  try {
    const addOns = await AddOnModel.find({
      isDeleted: false,
    });
    if (!addOns) return Helper.fail(res, "AddOns not found");
    return Helper.success(res, "AddOns found", addOns);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch AddOns");
  }
};
//for updating Promo Code
const updateAddOn = async (req, res) => {
  try {
    const { addOnId } = req.params;
    const { name, price, isActive } = req.body;
    if (!addOnId) {
      return Helper.fail(res, "addOnId is missing from request");
    }
    // if (!name) {
    //   return Helper.fail(res, "name is missing from request");
    // }
    // if (!price) {
    //   return Helper.fail(res, "price is missing from request");
    // }
    //checking Add exist or not
    let addOn = await AddOnModel.findById({ _id: addOnId, isDeleted: false });
    if (!addOn) {
      return Helper.fail(res, "AddOn not found!");
    }
    let objToUpdate = {};
    if (name) {
      objToUpdate.name = name;
      objToUpdate.price = price;
      objToUpdate.isActive = isActive;
    }

    let updatedAddOn = await AddOnModel.findByIdAndUpdate(
      addOnId,
      objToUpdate,
      {
        new: true,
      }
    );
    if (updatedAddOn) {
      return Helper.success(res, "AddOn  updated successfully!", updatedAddOn);
    }
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
module.exports = { addOnRegister, findAllAddOns, updateAddOn };
