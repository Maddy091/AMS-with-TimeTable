// src/Login.js

import React, { useState, useEffect } from 'react';
import getEnvironment from "../getenvironment";
import './login.css'
import logoImage from '../assets/logo.png'; 
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const apiUrl=getEnvironment();



  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { email, password };
    console.log(userData)
    console.log(apiUrl)
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData.message);
        // Redirect to the dashboard page on successful login
        window.location.href = '/dashboard';
      } else {
        // Handle login errors, e.g., display an error message
        console.error('Login failed');
      }
    } catch (error) {
      console.error('An error occurred', error);
    }
  };

  return (

<div className="App">
          <div className="appAside" />
          <div className="appForm">

          <div className="formCenter">
          <div className="logoContainer">
                <img src={logoImage} alt="Your Logo" className="logoImage" />
              </div>       
    <form className="formFields" onSubmit={handleSubmit}>
      <div className="formField">
     
        <label className="formFieldLabel" htmlFor="email">
          E-Mail Address
        </label>
        <input
          type="email"
          id="email"
          className="formFieldInput"
          placeholder="Enter your email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="formField">
        <label className="formFieldLabel" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="formFieldInput"
          placeholder="Enter your password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
    />
      </div>
        <button type="submit">Login</button>
      </form>
    </div>


</div>
          </div>
  );
}

export default Login;
