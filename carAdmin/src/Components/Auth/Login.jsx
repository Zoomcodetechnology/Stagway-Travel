import { useState } from "react";
import style from "../Auth/login.module.css";
import logo from "../../assets/logo.png";
import { FaRegUser } from "react-icons/fa6";
import { FiLock } from "react-icons/fi";
import { baseUrl } from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster,toast } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  // State for storing input data
  const [inputValues, setInputValues] = useState({
    email: "",
    password: "",
  });

  // Handle input changes
  const inputHandler = (e) => {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value });
  };

  // Handle Admin Login
  const loginAdmin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${baseUrl}/admin/login`, inputValues);

      if (res.data.status) {
        toast.success(res.data.message);
        // Save token and reset input fields
        localStorage.setItem("tokenData", res.data.data.token);
        localStorage.setItem("CarBookingAdminToken", res.data.data.token);
        setInputValues({
          email: "",
          password: "",
        });

        // Redirect to dashboard after success
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred!"
      );
    }
  };

  return (
    <div className={style.loginPageSection}>
   <Toaster position="top-center"/>
      <form className="login pt-5" onSubmit={loginAdmin}>
        <img
          src={logo}
          className={`${style.carlogo} mx-auto d-block`}
          alt="Logo"
        />

        {/* Email Input */}
        <div className={style.inputContainer}>
          <FaRegUser className={style.inputIcon} />
          <input
            type="text"
            placeholder="USERNAME"
            name="email"
            className={style.loginInput}
            value={inputValues.email}
            onChange={inputHandler}
            required
          />
        </div>

        {/* Password Input */}
        <div className={style.inputContainer}>
          <FiLock className={style.inputIcon} />
          <input
            type="password"
            placeholder="PASSWORD"
            name="password"
            className={style.loginInput}
            value={inputValues.password}
            onChange={inputHandler}
            required
          />
        </div>

        <button type="submit" className={style.loginBtn}>
          LOGIN
        </button>
      </form>
    </div>
  );
};

export default Login;


