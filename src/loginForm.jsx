import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    // Check if user is signed in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log('user not found');
        
        // Redirect to sign-in page if user is not signed in
        navigate("/");
      }else{
        navigate("/dashboard")
      }
    });

    return () => unsubscribe();
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("loggedin successfully!");
      console.log("User Details:", user);

      navigate("/dashboard");
    } catch (error) {
      console.error("no user found", error.message);
      alert("no user found", error.message);
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
    inputFocus: {
      borderColor: "red",
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
    buttonHover: {
      backgroundColor: "#2124",
    },
    text: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "14px",
      color: "black",
    },
    link: {
      color: "blue",
      fontWeight: "bold",
      textDecoration: "none",
    },
    "@media screen and (max-width: 600px)": {
      container: {
        maxWidth: "90%",
        marginTop: "15vh",
      },
    },
  };
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Log In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={styles.input}
          onFocus={(e) =>
            (e.target.style.borderColor = styles.inputFocus.borderColor)
          }
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          required
        />
        <input
          type="password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={styles.input}
          onFocus={(e) =>
            (e.target.style.borderColor = styles.inputFocus.borderColor)
          }
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          required
        />
        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor =
              styles.buttonHover.backgroundColor)
          }
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#0077ff")}
        >
          Log In
        </button>
      </form>
      <p style={styles.text}>
        Don't have an account?{" "}
        <a href="/signup" style={styles.link}>
          Sign Up
        </a>
      </p>
    </div>
  );
};

export default LoginForm;
