import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const {login} = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle login logic here
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });
      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem("token", response.data.token);
        navigate('/home');
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error);
      } else {
        setError("Server Error");
      }
    }
  };
  return (
    <div
      className="flex flex-col items-center h-screen justify-center  
                bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6"
    >
      <h2 className="font-sans-serif text-3xl text-white italic">
        Employee Management System
      </h2>
      <div className="border shadow p-6 w-80 bg-white">
        {error && <p className="text-red-500">{error}</p>}
      <form  onSubmit={handleSubmit}>
        <h2 className=" text-2xl font-bold mb-4 ">Login</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">
            Email:
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">
            Password:
          </label>
          <input
            type="password"
            id="password"
            placeholder="***********"
            className="w-full px-3 py-2 border"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox text-teal-600" />
            <span className="ml-2 text-gray-700">Remember Me</span>
            <a href="#" className="text-teal-600 hover:underline ml-auto">
              Forgot Password?
            </a>
          </label>
        </div>
        <div className="mb-4">
          <button type="submit" className="w-full bg-teal-600 text-white py-2 ">
            Login
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default Login;
