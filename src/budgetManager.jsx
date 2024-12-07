import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import {
  auth,
  db,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "./firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";

const BudgetManager = () => {
  const [budgetName, setBudgetName] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterActive, setFilterActive] = useState(false); 
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/"); 
      } else {
        setUser(user); 
        loadUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    const budgetsSnapshot = await getDocs(
      collection(db, "users", userId, "budgets")
    );
    const userBudgets = [];
    budgetsSnapshot.forEach((doc) => {
      userBudgets.push({ ...doc.data(), id: doc.id }); 
    });
    setBudgets(userBudgets);
  };

  // Add a new budget to Firestore
  const handleAddBudget = async (e) => {
    e.preventDefault();

    if (!budgetName || totalBudget <= 0) {
      alert("Please enter a valid budget name and amount.");
      return;
    }

    const newBudget = {
      name: budgetName,
      total: parseFloat(totalBudget),
      remaining: parseFloat(totalBudget),
      expenses: [],
      date: new Date().toLocaleString(),
    };

    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "budgets"),
        newBudget
      ); // Save the new budget to Firestore
      setBudgets([...budgets, { ...newBudget, id: docRef.id }]); 
      setBudgetName("");
      setTotalBudget("");
    } catch (error) {
      console.error("Error adding budget: ", error);
    }
  };

  // Add a new expense to a selected budget
  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (selectedBudgetIndex === null) {
      alert("Please select a budget to add expenses.");
      return;
    }

    if (!expenseName || !expenseAmount || !expenseCategory) {
      alert("Please fill out all expense fields.");
      return;
    }

    const expenseValue = parseFloat(expenseAmount);
    if (expenseValue <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }

    const selectedBudget = budgets[selectedBudgetIndex];
    if (expenseValue > selectedBudget.remaining) {
      alert("Expense exceeds remaining budget!");
      return;
    }

    // Update the selected budget and add the expense
    const newExpense = {
      name: expenseName,
      amount: expenseValue,
      category: expenseCategory, 
      date: new Date().toISOString(),
    };

    const updatedBudget = {
      ...selectedBudget,
      expenses: [...selectedBudget.expenses, newExpense],
      remaining: selectedBudget.remaining - expenseValue,
    };

    try {
      const budgetRef = doc(
        db,
        "users",
        user.uid,
        "budgets",
        selectedBudget.id
      );
      await updateDoc(budgetRef, updatedBudget);
      setBudgets((prevBudgets) => {
        const updatedBudgets = [...prevBudgets];
        updatedBudgets[selectedBudgetIndex] = updatedBudget;
        return updatedBudgets;
      });

      setExpenseName("");
      setExpenseAmount("");
      setExpenseCategory("");
    } catch (error) {
      console.error("Error adding expense: ", error);
    }
  };


  // Delete an expense from a selected budget
  const handleDeleteExpense = async (budgetIndex, expenseIndex) => {
    const selectedBudget = budgets[budgetIndex];
    const deletedExpense = selectedBudget.expenses[expenseIndex];

    const updatedExpenses = selectedBudget.expenses.filter(
      (_, index) => index !== expenseIndex
    );
    const updatedBudget = {
      ...selectedBudget,
      expenses: updatedExpenses,
      remaining: selectedBudget.remaining + deletedExpense.amount,
    };

    try {
      const budgetRef = doc(
        db,
        "users",
        user.uid,
        "budgets",
        selectedBudget.id
      );
      await updateDoc(budgetRef, updatedBudget);
      setBudgets((prevBudgets) => {
        const updatedBudgets = [...prevBudgets];
        updatedBudgets[budgetIndex] = updatedBudget;
        return updatedBudgets;
      });
    } catch (error) {
      console.error("Error deleting expense: ", error);
    }
  };

  // Delete a budget from Firestore
  const handleDeleteBudget = async (budgetIndex) => {
    const selectedBudget = budgets[budgetIndex];

    try {
      const budgetRef = doc(
        db,
        "users",
        user.uid,
        "budgets",
        selectedBudget.id
      );
      await deleteDoc(budgetRef);
      setBudgets(budgets.filter((_, index) => index !== budgetIndex)); 
    } catch (error) {
      console.error("Error deleting budget: ", error);
    }
  };

  // Log out the user
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error logging out: ", error.message);
    }
  };

  // Filter expenses by date
  const filterExpensesByDate = () => {
    if (!filterActive || !startDate || !endDate) {
      return budgets; 
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return budgets.map((budget) => ({
      ...budget,
      filteredExpenses: budget.expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate >= start && expenseDate <= end;
      }),
    }));
  };

  const filteredBudgets = useMemo(
    () => filterExpensesByDate(),
    [budgets, filterActive, startDate, endDate]
  );

  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "30px",
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: "grey",
    
    },
    title: {
      textAlign: "center",
      marginBottom: "20px",
      fontSize: "24px",
      fontWeight: "bold",
    },
    form: {
      marginBottom: "20px",
    },
    input: {
      width: "90%",
      padding: "10px",
      margin: "10px 20px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "16px",
    },
    button: {
      width: "50%",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#28a745",
      color: "#fff",
      fontSize: "18px",
      cursor: "pointer",
      margin: "10px 200px",
    },
    logoutButton: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#dc3545",
      color: "#fff",
      fontSize: "18px",
      cursor: "pointer",
      marginTop: "20px",
    },
    deleteButton: {
      backgroundColor: "#dc3545",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "6px 10px",
      cursor: "pointer",
      margin: "0px,50px",
    },
    budget: {
      marginBottom: "20px",
      padding: "15px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
    expense: {
      marginBottom: "10px",
      padding: "5px",
      fontSize: "5px",
      backgroundColor: "#cccac6",
      borderRadius: "8px",
    },
    select: {
      width: "93%",
      padding: "10px",
      margin: "10px 20px",
      borderRadius: "8px",
      fontSize: "16px",
    },
    budgettext: {
      backgroundColor: "blue",
      color: "white",
      fontSize: "30px",
      padding: "10px",
      borderRadius: "10px",
    },
    budgetName: {
      backgroundColor: "black",
      padding: "10px",
      width: "97.5%",
      borderRadius: "10px",
      color: "white",
    },
    totalBudget: {
      backgroundColor: "skyblue",
      padding: "10px",
      borderRadius: "10px",
    },
    remainingBudg: {
      backgroundColor: "red",
      padding: "10px",
      borderRadius: "10px",
    },
    date: {
      fontSize: "12px",
      margin: "0x 0px",
      padding: "5px",
      borderRadius: "10px",
      backgroundColor: "lightblue",
    },
    calendar: {
      margin: "10px 20px",
      padding: "10px",
      backgroundColor: "",
      border: "solid black 3px",
      display: "flex",
      justifyContent: "spacebetween",
    },
    expenseName: {
      backgroundColor: "#b55020",
      padding: "5px",
      borderRadius: "5px",
      fontSize: "15px",
    },
    label: {
      backgroundColor: "lightblue",
      borderRadius: "5px",
      padding: "5px",
      margin: "10px 20px",
    },
    exphead: {
      backgroundColor: "black",
      color:"white",
      borderRadius: "10px",
      padding: "10px",
    },
  };
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Budget Manager</h1>
      <form style={styles.form} onSubmit={handleAddBudget}>
        <input
          style={styles.input}
          type="text"
          placeholder="Budget Name"
          value={budgetName}
          onChange={(e) => setBudgetName(e.target.value)}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Total Budget"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
        />
        <button style={styles.button} type="submit">
          Add Budget
        </button>
      </form>

      <select
        style={styles.select}
        value={selectedBudgetIndex}
        onChange={(e) => setSelectedBudgetIndex(e.target.value)}
      >
        <option value="">Select a budget</option>
        {budgets.map((budget, index) => (
          <option key={budget.id} value={index}>
            {budget.name}
          </option>
        ))}
      </select>

      <form onSubmit={handleAddExpense}>
        <input
          style={styles.input}
          type="text"
          placeholder="Expense Name"
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Expense Amount"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
        />
        <select
          style={styles.select}
          value={expenseCategory}
          onChange={(e) => setExpenseCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
        <button style={styles.button} type="submit">
          Add Expense
        </button>
      </form>

      <div>
        <div>
          <label style={styles.label}>Start Date: </label>
          <input
            style={styles.calendar}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label style={styles.label}>End Date: </label>
          <input
            style={styles.calendar}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            style={styles.button}
            onClick={() => setFilterActive(!filterActive)}
          >
            {filterActive ? "Clear Filter" : "Apply Filter"}
          </button>
        </div>

        <h3 style={styles.budgettext}>Budgets</h3>
        {filteredBudgets.map((budget, budgetIndex) => (
          <div key={budget.id} style={styles.budget}>
            <h1 style={styles.budgetName}>{budget.name}</h1>
            <p style={styles.totalBudget}>Total Budget: ${budget.total}</p>
            <p style={styles.remainingBudg}>Remaining: ${budget.remaining}</p>
            <p style={styles.date}>Date Created: {budget.date}</p>

            <button
              style={styles.deleteButton}
              onClick={() => handleDeleteBudget(budgetIndex)}
            >
              Delete Budget
            </button>
            <div style={styles.expbody}>
              <h2 style={styles.exphead}>Expenses</h2>

              {budget.filteredExpenses && budget.filteredExpenses.length > 0 ? (
                budget.filteredExpenses.map((expense, expenseIndex) => (
                  <div key={expenseIndex} style={styles.expense}>
                    <p style={styles.expenseName}>
                      {expense.name}: ${expense.amount}
                    </p>
                    <p style={styles.date}>Date Created: {budget.date}</p>
                    <button
                      style={styles.deleteButton}
                      onClick={() =>
                        handleDeleteExpense(budgetIndex, expenseIndex)
                      }
                    >
                      Delete Expense
                    </button>
                  </div>
                ))
              ) : (
                <p>No expenses in this date range</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button style={styles.logoutButton} onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

export default BudgetManager;
