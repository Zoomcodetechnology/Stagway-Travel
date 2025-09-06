const FaqModel = require("../model/faqModel");
const Helper = require('../utils/helper');
//for creating the FAQ
const createFaq = async (req, res) => {
  try {
    const { question, answer, type, } = req.body;
    if (!question) return Helper.fail(res, "question Is Required");
    if (!answer) return Helper.fail(res, "answer Is Required");
    if (!type) return Helper.fail(res, "type Is Required");
    const existingFaq = await FaqModel.findOne({
      question,
      isDeleted: false,
    });
    if (existingFaq) {
      return Helper.fail(res, "Faq with this question already exists!");
    }
    const faqObj = {
      question, 
      answer,
      type,
    };
    const createdFaq = await FaqModel.create(faqObj);
    return Helper.success(
      res,
      "Faq created successfully!",
      createdFaq
    );
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
//for Soft Delete the FAQ
const removeFaq = async (req, res) => {
  try {
    const { faqId } = req.params;
    if (!faqId) return Helper.fail(res, "faqId is required!");

    const deleted = await FaqModel.findByIdAndUpdate(
      faqId,
     
      { new: true }
    );
    if (!deleted) return Helper.fail(res, "Faq not found!");

    return Helper.success(res, "Faq deleted successfully!", deleted);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to delete Faq.");
  }
};
//for getting All PromoCodes
const findAllFaqs = async (req, res) => {
  try {
    const faqs = await FaqModel.find({ isDeleted: false });
    if (!faqs || faqs.length === 0) {
      return Helper.fail(res, "No FAQs found!");
    }
    return Helper.success(res, "FAQs found!", faqs);
  } catch (error) {
    console.error(error);
    return Helper.fail(res, "Failed to fetch FAQs.");
  }
};
//for updating Faqs
const updateFaqs = async (req, res) => {
  try {
    const { faqId,  answer, type,   } = req.body;
    if (!faqId) {
      return Helper.fail(res, "faqId is required");
    }
    let faq = await FaqModel.findById({ _id: faqId, isDeleted: false });
    if (!faq) {
      return Helper.fail(res, "faq not found!");
    }
    let objToUpdate = {};
   
  
 

    let updateFaq = await FaqModel.findByIdAndUpdate(faqId, objToUpdate, {
      new: true,
    });
    if (updateFaq) {
      return Helper.success(res, "Faq  updated successfully!", updateFaq);
    }
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
module.exports = {
  createFaq,
  removeFaq,
  findAllFaqs,
  updateFaqs
};
