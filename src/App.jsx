import React from "react";
import SignUpForm from "./signupForm";
import LoginForm from "./loginForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BudgetManager from "./budgetManager";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUpForm />}></Route>
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/" element={<LoginForm />}></Route>
        <Route path="/dashboard" element={<BudgetManager />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
