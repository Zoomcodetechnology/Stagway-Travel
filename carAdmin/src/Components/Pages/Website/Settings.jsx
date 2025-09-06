import React, { useEffect, useState } from "react";
import style from "../../Pages/Website/settings.module.css";
import Addons from "./Addons";
import Promocode from "./Promocode";
import Faqs from "./Faqs";
import { toast, Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { postData } from "../../../utility/Utility";

const Settings = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [promoCode, setPromoCode] = useState({
    startDate:"",
    endDate: "",
    code: "",
    discount: 0,
  });
  console.log(promoCode)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "discount" && value >= 100) {
      Swal.fire("Invalid Discount!", "Must be less than 100.", "error");
      return;
    }
    if (
      name === "endDate" &&
      promoCode.startDate &&
      value < promoCode.startDate
    ) {
      Swal.fire(
        "Invalid Date!",
        "End Date must be greater than Start Date.",
        "error"
      );

      return;
    }

    if (
      name === "startDate" &&
      promoCode.endDate &&
      value > promoCode.endDate
    ) {
      Swal.fire(
        "Invalid Date!",
        "Start Date cannot be greater than End Date.",
        "error"
      );
      return;
    }

    setPromoCode((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [promos, setPromos] = useState([]);

  const addPromoCode = async (e) => {
    e.preventDefault();
    try {
      const response = await postData("/promoCode/create", promoCode);
      if(response.status){
        Swal.fire("Success!", response?.message, "success");
      console.log("Promo Code Added:", response?.message);
      setPromos((prev) => [...prev, response?.data]);
      setPromoCode({ startDate: "", endDate: "", code: "", discount: 0 });
      }else{
        Swal.fire("Failed!", response?.message, "error");
      }
    } catch (error) {
      console.error("Error adding promo code:", error);
    }
  };

  const [faq, setFaq] = useState({
    question: "",
    answer: "",
    type: [],
  });
  const [addon, setAddon] = useState({
    name: "",
    price: "",
  });

  const [airport, setAirport] = useState({
    name: "",
  });

  const [fareDetails, setFareDetails] = useState({
    inclusions: "",
    exclusions: "",
    termsAndConditions: "",
  });
  const [fareDetailsId, setFareDetailsId] = useState(null);

  // Function to handle FAQ form change
  const handleFaqChange = (e) => {
    const { name, value } = e.target;
    setFaq((prevFaq) => ({
      ...prevFaq,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFaq((prevFaq) => ({
      ...prevFaq,
      type: checked
        ? [...prevFaq.type, value]
        : prevFaq.type.filter((t) => t !== value),
    }));
  };

  const [faqs, setFaqs] = useState([]);

  const createFaq = async () => {
    try {
      if (!faq.question || !faq.answer || faq.type.length === 0) {
        Swal.fire("Failed!", "Please fill all fields", "error");
        return;
      }

      const response = await postData("/faq/create", {
        question: faq.question,
        answer: faq.answer,
        type: faq.type,
      });

      console.log("API Response:", response);
      setFaqs((prev) => [...prev, response.data]);
      if (response?.status) {
        Swal.fire("Success!", response?.message, "success");
      } else {
        Swal.fire(
          "Failed!",
          response?.message || "Something went wrong",
          "error"
        );
      }

      setFaq({ question: "", answer: "", type: [] });
    } catch (error) {
      console.error("Error creating FAQ:", error);
      Swal.fire("Failed!", "An error occurred", "error");
    }
  };
  const fetchfaqData = async () => {
    try {
      const response = await postData("/faq/findall", {});
      const latestFaqs = response.data.slice(-10).reverse();
      setFaqs(latestFaqs);
    } catch (error) {
      Swal.fire("Failed!", response.message, "error");
    }
  };

  useEffect(() => {
    fetchfaqData();
  }, []);

  const [addons, setAddons] = useState([]);

  const createAddOn = async (e) => {
    e.preventDefault();
    try {
      const response = await postData("/addOn/create", addon);
      if(response.status){
        Swal.fire("Success!", response?.message, "success");
        console.log("Addons Added:", response?.message);
        setAddons((prev) => [...prev, response?.data]);
        setAddon({ name: "", price: "" });
      }else{
      Swal.fire("Failed!", response?.message, "error");
      }
    } catch (error) {
      console.error("Error adding addons:", error);
    }
  };

  const fetchAddons = async () => {
    try {
      const response = await postData("/addOn/findAll");
      if(response?.status){
        setAddons(response?.data);
      }else {
        Swal.fire("Failed!", response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching addons:", error);
    }
  };

  useEffect(() => {
    fetchAddons();
  },[]);

  //Promocode

  useEffect(() => {
    fetchPromoCode();
  }, []);
  const fetchPromoCode = async () => {
    try {
      const response = await postData("/promoCode/findAll");

      setPromos(response?.data);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    }
  };

  //Faredetails code
  useEffect(() => {
    fetchFareDetails();
  }, []);
  const fetchFareDetails = async () => {
    try {
      const response = await postData("/fareDetails/getAllFareDetails");

      if (response?.status) {
        const details = response?.data[0]?.fareDetails;
        setFareDetailsId(response?.data[0]._id);
        setFareDetails({
          inclusions: details.inclusions.join("\n"),
          exclusions: details.exclusions.join("\n"),
          termsAndConditions: details.termsAndConditions,
        });
      } else {
        Swal.fire("Failed!", response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching fare details:", error);
      Swal.fire("Failed!", response.data.message, "error");
    }
  };

  const handleFareDetailsChange = (e) => {
    const { name, value } = e.target;
    setFareDetails((prev) => ({ ...prev, [name]: value }));
  };

  const updateFareDetails = async () => {
    if (!fareDetailsId) {
      Swal.fire("Failed!", response.data.message, "error");
      return;
    }

    try {
      const response = await postData("/fareDetails/updateFareDetails", {
        fareDetailsId: fareDetailsId,
        fareDetails: {
          inclusions: fareDetails.inclusions.split("\n"),
          exclusions: fareDetails.exclusions.split("\n"),
          termsAndConditions: fareDetails.termsAndConditions,
        },
      });

      if (response.status) {
        Swal.fire("Success!", response?.message, "success");
      } else {
        Swal.fire("Failed!", response?.message, "error");
      }

      console.log("Updated Fare Details Response:", response?.data);
    } catch (error) {
      console.error("Error updating fare details:", error);
      Swal.fire("Failed!", response?.message, "error");
    }
  };

  //inclusion exclusion creation
  return (
    <div className={style.settingSection}>
      <Toaster />
      {/* Top Settings Section */}
      <div className={`mb-4 mt-6 ${style.promoSection}`}>
        <div className="">
          <span className={`${style.Commoncolor} ${style.textPrimary}`}>
            Promo Code
          </span>
          <input
            type="date"
            className={style.inputDate}
            name="startDate"
            value={promoCode.startDate}
            min={new Date().toISOString().split("T")[0]} // Prevents past dates
            // onFocus={(e) =>
            //   (e.target.value =
            //     e.target.value || new Date().toISOString().split("T")[0])
            // } 
            onChange={handleChange}
          />
          <span className={style.inputDate}> &gt; </span>
          <input
            type="date"
            className={style.inputDate}
            name="endDate"
            min={new Date(new Date().setDate(new Date().getDate() + 1))
              .toISOString()
              .split("T")[0]} // Prevents past dates
            value={promoCode.endDate}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="   Unique Code "
            name="code"
            value={promoCode.code}
            className={style.inputDate}
            onChange={handleChange}
          />
          <input
            type="number"
            placeholder="Discount in % "
            name="discount"
            value={promoCode.discount}
            className={style.inputDate}
            onKeyDown={(e) => {
              if (
                e.key === "e" ||
                e.key === "E" ||
                e.key === "+" ||
                e.key === "-"
              ) {
                e.preventDefault();
              }
            }}
            onChange={handleChange}
          />
          <button className={`btn ${style.applyButton}`} onClick={addPromoCode}>
            Add
          </button>
        </div>
      </div>
      <div
        className={`col-sm-6 d-flex align-items-center ${style.adonSection}`}
      >
        <span
          className={`${style.promoAddonsTxt} ${style.Commoncolor} ${style.addonstxt}`}
        >
          Add Ons
        </span>
        <input
          type="text"
          placeholder="   Name"
          className={` ${style.addoninput}`}
          value={addon.name}
          onChange={(e) => setAddon({ ...addon, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="   Costing"
          className={style.addoninput}
          value={addon.price}
          onKeyDown={(e) => {
            if (
              e.key === "e" ||
              e.key === "E" ||
              e.key === "+" ||
              e.key === "-"
            ) {
              e.preventDefault();
            }
          }}
          onChange={(e) => setAddon({ ...addon, price: e.target.value })}
        />
        <button className={`btn  ${style.addonbtn}`} onClick={createAddOn}>
          Add
        </button>
      </div>

      {/* Inclusion, Exclusion, and T&C Section */}
      <div className="row">
        <div className="col-sm-4">
          <h6>Exclusions</h6>
          <textarea
            name="exclusions"
            value={fareDetails.exclusions}
            onChange={handleFareDetailsChange}
            className={`form-control ${style.txtclass}`}
          ></textarea>
        </div>
        <div className="col-sm-4">
          <h6>Inclusion</h6>
          <textarea
            name="inclusions"
            value={fareDetails.inclusions}
            onChange={handleFareDetailsChange}
            className={`form-control ${style.txtclass}`}
          ></textarea>
        </div>
        <div className="col-sm-4">
          <h6>T&C</h6>
          <textarea
            name="termsAndConditions"
            value={fareDetails.termsAndConditions}
            onChange={handleFareDetailsChange}
            className={`form-control ${style.txtclass}`}
          ></textarea>
          <div className="d-flex mt-2 justify-content-end">
            <button
              className={style.updatesettingbtn}
              onClick={updateFareDetails}
            >
              Update
            </button>
          </div>
        </div>
      </div>
      {/* FAQ Section */}
      <div className={style.faqSection}>
        <span
          className={`${style.Commoncolor} ${style.promoAddonsTxt} ${style.faqsize}`}
        >
          FAQs?
        </span>
        <div className={`row ${style.accordinclass}`}>
          <div className={`col-sm-8 mt-2 ${style.questionpart}`}>
            <input
              type="text"
              className={` form-control ${style.myclass}`}
              placeholder="Question"
              name="question"
              value={faq.question}
              onChange={handleFaqChange}
            />
            <textarea
              className={`form-control ${style.txtclass}`}
              placeholder="Answer"
              name="answer"
              value={faq.answer}
              onChange={handleFaqChange}
            ></textarea>
          </div>

          <div className={`col-sm-2 ${style.faqRightpart}`}>
            <div className="d-flex flex-column">
              <strong className="mb-2">
                <input
                  type="checkbox"
                  className={style.faqchkbox}
                  value="Local"
                  name="type"
                  checked={faq.type.includes("Local")}
                  onChange={handleCheckboxChange}
                />{" "}
                Local
              </strong>
              <strong className="mb-2">
                <input
                  type="checkbox"
                  className={style.faqchkbox}
                  value="Intercity"
                  name="type"
                  checked={faq.type.includes("Intercity")}
                  onChange={handleCheckboxChange}
                />{" "}
                Intercity
              </strong>
              <strong>
                <input
                  type="checkbox"
                  className={style.faqchkbox}
                  value="Airport Transfer"
                  name="type"
                  checked={faq.type.includes("Airport Transfer")}
                  onChange={handleCheckboxChange}
                />{" "}
                Airport Transfer
              </strong>
            </div>
          </div>

          <div className={`col-sm-2 ${style.faqRightpart}`}>
            <button
              className={`btn  btn-sm text-white mt-3 ${style.Commoncolorbg}`}
              onClick={createFaq}
            >
              Create
            </button>
          </div>
        </div>
      </div>

      <ul
        className={` nav nav-pills mb-3 mt-4  ${style.tabsHere}`}
        id="pills-tab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className={` nav-link active  ${style.faqt}`}
            id="pills-home-tab"
            data-bs-toggle="pill"
            data-bs-target="#pills-home"
            type="button"
            role="tab"
            aria-controls="pills-home"
            aria-selected="true"
          >
            {/* Faqs */}
            <span>Faqs</span>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={` nav-link ${style.pcode}`}
            id="pills-profile-tab"
            data-bs-toggle="pill"
            data-bs-target="#pills-profile"
            type="button"
            role="tab"
            aria-controls="pills-profile"
            aria-selected="false"
          >
            <span>Promo Codes</span>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${style.addon}`}
            id="pills-contact-tab"
            data-bs-toggle="pill"
            data-bs-target="#pills-contact"
            type="button"
            role="tab"
            aria-controls="pills-contact"
            aria-selected="false"
          >
            <span> Add Ons</span>
          </button>
        </li>
      </ul>
      <div className="tab-content" id="pills-tabContent">
        <div
          class="tab-pane fade show active"
          id="pills-home"
          role="tabpanel"
          aria-labelledby="pills-home-tab"
        >
          <Faqs faqs={faqs} setFaqs={setFaqs} />
        </div>
        <div
          class="tab-pane fade"
          id="pills-profile"
          role="tabpanel"
          aria-labelledby="pills-profile-tab"
        >
          <Promocode promos={promos} setPromos={setPromos} />
        </div>
        <div
          class="tab-pane fade"
          id="pills-contact"
          role="tabpanel"
          aria-labelledby="pills-contact-tab"
        >
          <Addons addons={addons} setAddons={setAddons} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
