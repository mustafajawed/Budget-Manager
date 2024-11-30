import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const navigate = useNavigate(); // Hook to navigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's displayName with the username
      await updateProfile(user, {
        displayName: username, // Setting the username as displayName
      });

      console.log("Account created successfully!");
      console.log("User Details:", user);
      
      // Redirect to login page
      navigate("/login"); // Make sure the path is correct for your login page
    } catch (error) {
      alert(error.message); // Show error message
    }
  };

  const styles = {
    container: {
      maxWidth: "400px",
      margin: "0 auto",
      marginTop: "10vh",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
      background: "linear-gradient(135deg, blue, green)",
      color: "black",
      fontFamily: "'Poppins', sans-serif",
    },
    title: {
      textAlign: "center",
      marginBottom: "20px",
      fontSize: "28px",
      fontWeight: "bold",
      color: "black",
    },
    input: {
      width: "100%",
      padding: "12px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "16px",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: "12px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "blue",
      color: "#fff",
      fontSize: "18px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your username"
          style={styles.input}
          onChange={(e) => setUsername(e.target.value)} // Set username
          required
        />
        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Sign Up
        </button>
      </form>
      <p style={styles.text}>
        Already have an account?{" "}
        <a href="/login" style={styles.link}>Log In</a>
      </p>
    </div>
  );
};

export default SignUpForm;
