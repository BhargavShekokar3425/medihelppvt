import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

const SignUp = () => {
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({
    role: "Patient",
    username: "",
    dob: "",
    address: "",
    contact: "",
    bloodGroup: "",
    gender: "",
    allergies: ""
  });

  const navigate = useNavigate();

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        ...formData,
      });

      alert("Sign Up successful! Please log in.");
      setMode("login");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
  className="d-flex justify-content-center align-items-center gradient-bg"
  style={{
    minHeight: "calc(100vh - 120px)", // Adjust if you know your navbar/footer height
    backgroundColor: "#f8f9fa",
    padding: "20px"
  }}
>
  <div
    className="card p-4 shadow rounded w-100"
    style={{
      maxWidth: "500px",
      maxHeight: "100%",
      overflowY: "auto", // This makes the form scrollable within the card
    }}
  >
    <h2 className="text-center mb-4 text">Welcome to <span style={{ color: "#5aa3e7" }}>Medi</span><span style={{ color: "#d73434" }}>Help</span></h2>
    
    {/* form starts here */}
    <form onSubmit={mode === "signup" ? handleSignup : handleLogin}>
      {/* common fields */}

      <div className="mb-3">
        <label>Email:</label>
        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="mb-3">
        <label>Password:</label>
        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      {/* signup-specific fields */}
      {mode === "signup" && (
        <>
        <hr></hr>
        <div className="mb-3">
            <label>Name:</label>
            <input type="text" name="name" className="form-control" onChange={handleInput} required />
          </div>
         
          <div className="mb-3">
            <label>Role:</label>
            <select className="form-control" name="role" onChange={handleInput} required>
              <option value="">Select Role</option>
              <option>Patient</option>
              <option>Doctor</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Username (Roll No./Doctor ID):</label>
            <input type="text" name="username" className="form-control" onChange={handleInput} required />
          </div>

          <div className="mb-3">
            <label>Date of Birth:</label>
            <input type="date" name="dob" className="form-control" onChange={handleInput} required />
          </div>

          <div className="mb-3">
            <label>Address:</label>
            <textarea name="address" className="form-control" onChange={handleInput} required></textarea>
          </div>

          <div className="mb-3">
            <label>Contact Number:</label>
            <input type="tel" name="contact" className="form-control" onChange={handleInput} required />
          </div>

          <div className="mb-3">
            <label>Blood Group:</label>
            <input type="text" name="bloodGroup" className="form-control" onChange={handleInput} required />
          </div>

          <div className="mb-3">
            <label>Gender:</label>
            <select name="gender" className="form-control" onChange={handleInput} required>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Existing Allergies:</label>
            <textarea name="allergies" className="form-control" onChange={handleInput}></textarea>
          </div>
        </>
      )}

      <button type="submit" className="btn btn-success w-100">
        {mode === "signup" ? "Sign Up" : "Login"}
      </button>

      <p
        className="text-center mt-3"
        style={{ cursor: "pointer", color: "#007bff" }}
        onClick={() => setMode(mode === "signup" ? "login" : "signup")}
      >
        {mode === "signup"
          ? "Already have an account? Click to login"
          : "New here? Click to sign up"}
      </p>
    </form>
  </div>
</div>

    
    
//     <div className="d-flex justify-content-center align-items-center vh-100 bg-light ">
//     <div className="card p-4 shadow rounded" style={{ width: "100%", maxWidth: "500px" }}>
//       <h2 className="text-center mb-4 text-primary">Welcome to  <span style={{ color: "#5aa3e7" }}>Medi</span>
//       <span style={{ color: "#d73434" }}>Help</span></h2>
  
//       {!mode && (
//         <div className="text-center">
//           <p className="mb-3">What would you like to do?</p>
//           <button className="btn btn-primary me-2 gradient-background btn-outline-none" onClick={() => setMode("signup")}>Sign Up</button>
//           <button className="btn btn-outline-secondary" onClick={() => setMode("login")}>Login</button>
//         </div>
//       )}
  
//       {(mode === "signup" || mode === "login") && (
//         <form onSubmit={mode === "signup" ? handleSignup : handleLogin} className="mt-3">
  
//           {/* Common Fields */}
//           <div className="mb-3">
//             <label>Email:</label>
//             <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
//           </div>
  
//           <div className="mb-3">
//             <label>Password:</label>
//             <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
//           </div>
  
//           {/* Signup-specific Fields */}
//           {mode === "signup" && (
//             <>
//               <div className="mb-3">
//                 <label>Role:</label>
//                 <select className="form-control" name="role" onChange={handleInput} required>
//                   <option value="">Select Role</option>
//                   <option>Patient</option>
//                   <option>Doctor</option>
//                 </select>
//               </div>
  
//               <div className="mb-3">
//                 <label>Username (Roll No./Doctor ID):</label>
//                 <input type="text" name="username" className="form-control" onChange={handleInput} required />
//               </div>
  
//               <div className="mb-3">
//                 <label>Date of Birth:</label>
//                 <input type="date" name="dob" className="form-control" onChange={handleInput} required />
//               </div>
  
//               <div className="mb-3">
//                 <label>Address:</label>
//                 <textarea name="address" className="form-control" onChange={handleInput} required></textarea>
//               </div>
  
//               <div className="mb-3">
//                 <label>Contact Number:</label>
//                 <input type="tel" name="contact" className="form-control" onChange={handleInput} required />
//               </div>
  
//               <div className="mb-3">
//                 <label>Blood Group:</label>
//                 <input type="text" name="bloodGroup" className="form-control" onChange={handleInput} required />
//               </div>
  
//               <div className="mb-3">
//                 <label>Gender:</label>
//                 <select name="gender" className="form-control" onChange={handleInput} required>
//                   <option value="">Select Gender</option>
//                   <option>Male</option>
//                   <option>Female</option>
//                   <option>Other</option>
//                 </select>
//               </div>
  
//               <div className="mb-3">
//                 <label>Existing Allergies:</label>
//                 <textarea name="allergies" className="form-control" onChange={handleInput}></textarea>
//               </div>
//             </>
//           )}
  
//           <button type="submit" className="btn btn-success w-100">
//             {mode === "signup" ? "Sign Up" : "Login"}
//           </button>
  
//           <p
//             className="text-center mt-3"
//             style={{ cursor: "pointer", color: "#007bff" }}
//             onClick={() => setMode(mode === "signup" ? "login" : "signup")}
//           >
//             {mode === "signup"
//               ? "Already have an account? Click to login"
//               : "New here? Click to sign up"}
//           </p>
//         </form>
//       )}
//     </div>
//   </div>
  
  );
};

export default SignUp;
