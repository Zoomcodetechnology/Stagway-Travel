const PromoCodeModel = require("../model/promoCodeModel");
const Helper = require('../utils/helper');
//for creating the Promo Code
const createPromoCode = async (req, res) => {
  try {
    const { code, discount, startDate, endDate } = req.body;
    if (!code) return Helper.fail(res, "Code Is Required");
    if (!discount) return Helper.fail(res, "discount Is Required");
    if (!startDate) return Helper.fail(res, "startDate Is Required");
    if (!endDate) return Helper.fail(res, "endDate Is Required");
    if (discount < 0 || discount > 100) {
      return res
        .status(400)
        .json({ message: "Discount must be between 0 and 100" });
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "Start date must be before end date" });
    }

    // Check if the Promo Code already exists
    const existingPromoCode = await PromoCodeModel.findOne({
      code,
      isDeleted: false,
    });
    if (existingPromoCode) {
      return Helper.fail(res, "PromoCode with this code already exists!");
    }
    const promoObj = {
      code: code.toUpperCase().trim(),
      discount,
      startDate,
      endDate,
    };
    const createdPromoCode = await PromoCodeModel.create(promoObj);
    return Helper.success(
      res,
      "PromoCode created successfully!",
      createdPromoCode
    );
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
//for Soft Delete the Promo Code
const removePromoCode = async (req, res) => {
  try {
    const { promoCodeId } = req.params;
    if (!promoCodeId) return Helper.fail(res, "promoCodeId is required!");

    const deleted = await PromoCodeModel.findByIdAndUpdate(
      promoCodeId,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return Helper.fail(res, "PromoCode not found!");

    return Helper.success(res, "PromoCode deleted successfully!", deleted);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to delete PromoCode.");
  }
};
//for getting All PromoCodes
const findAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCodeModel.find({ isDeleted: false });
    if (!promoCodes || promoCodes.length === 0) {
      return Helper.fail(res, "No Promo Code found!");
    }
    return Helper.success(res, "Promo Codes found!", promoCodes);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to fetch Promo Code.");
  }
};
//for updating Promo Code
const updatePromoCode = async (req, res) => {
  try {
    const { promoCodeId } = req.params;
    const { discount, startDate, endDate, status } = req.body;
    if (discount !== undefined && (discount < 0 || discount > 100)) {
      return Helper.fail(res, "Discount must be between 0 and 100");
    }
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return Helper.fail(res, "Start date must be before end date");
    }

    const promoCode = await PromoCodeModel.findById(promoCodeId);
    if (!promoCode || promoCode.isDeleted) {
      return Helper.fail(res, "Promo code not found");
    }
    // Update fields
    if (discount !== undefined) promoCode.discount = discount;
    if (startDate) promoCode.startDate = startDate;
    if (endDate) promoCode.endDate = endDate;
    if (status) promoCode.status = status;
    await promoCode.save();
    return Helper.success(res, "Promo code updated successfully", promoCode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
module.exports = {
  createPromoCode,
  removePromoCode,
  findAllPromoCodes,
  updatePromoCode
};
