// import React, { useState } from "react";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword
// } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
// import { auth } from "../firebase/config";
// import { getFirestore, doc, setDoc } from "firebase/firestore";

// const db = getFirestore();

// const SignUp = () => {
//   const [mode, setMode] = useState(null);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [formData, setFormData] = useState({
//     role: "Patient",
//     username: "",
//     dob: "",
//     address: "",
//     contact: "",
//     bloodGroup: "",
//     gender: "",
//     allergies: ""
//   });

//   const navigate = useNavigate();

//   const handleInput = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     try {
//       const userCred = await createUserWithEmailAndPassword(auth, email, password);
//       const uid = userCred.user.uid;

//       await setDoc(doc(db, "users", uid), {
//         email,
//         ...formData,
//       });

//       alert("Sign Up successful! Please log in.");
//       setMode("login");
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       navigate("/profile");
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2 className="mb-4">Welcome to MediHelp</h2>

//       {!mode && (
//         <div>
//           <p>What would you like to do?</p>
//           <button className="btn btn-primary me-2" onClick={() => setMode("signup")}>Sign Up</button>
//           <button className="btn btn-secondary" onClick={() => setMode("login")}>Login</button>
//         </div>
//       )}

//       {(mode === "signup" || mode === "login") && (
//         <form onSubmit={mode === "signup" ? handleSignup : handleLogin} className="mt-4">

//           {/* Common fields */}
//           <div className="mb-3">
//             <label>Email:</label>
//             <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
//           </div>

//           <div className="mb-3">
//             <label>Password:</label>
//             <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
//           </div>

//           {/* Signup-specific fields */}
//           {mode === "signup" && (
//             <>
//               <div className="mb-3">
//                 <label>Role:</label>
//                 <select className="form-control" name="role" onChange={handleInput}>
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
//                 <select name="gender" className="form-control" onChange={handleInput}>
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

//           <button type="submit" className="btn btn-success">
//             {mode === "signup" ? "Sign Up" : "Login"}
//           </button>

//           <p
//             style={{ cursor: "pointer", color: "#007bff", marginTop: "1rem" }}
//             onClick={() => setMode(mode === "signup" ? "login" : "signup")}
//           >
//             {mode === "signup"
//               ? "Already have an account? Click to login"
//               : "New here? Click to sign up"}
//           </p>
//         </form>
//       )}
//     </div>
//   );
// };

// export default SignUp;








  

/* OLD CODE */
// import React, { useState } from "react";
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
// import { auth } from "../firebase/config";

// const SignUp = () => {
//   const [mode, setMode] = useState(null); // 'signup' or 'login'
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const navigate = useNavigate();

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       alert("Sign Up successful! Please log in.");
//       setEmail("");
//       setPassword("");
//       setMode("login"); // redirect to login form
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       navigate("/profile");
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2 className="mb-4">Welcome to MediHelp</h2>

//       {!mode && (
//         <div>
//           <p>What would you like to do?</p>
//           <button className="btn btn-primary me-2" onClick={() => setMode("signup")}>Sign Up</button>
//           <button className="btn btn-secondary" onClick={() => setMode("login")}>Login</button>
//         </div>
//       )}

//       {(mode === "signup" || mode === "login") && (
//         <form onSubmit={mode === "signup" ? handleSignup : handleLogin} className="mt-4">
//           <div className="mb-3">
//             <label>Email:</label>
//             <input
//               type="email"
//               className="form-control"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label>Password:</label>
//             <input
//               type="password"
//               className="form-control"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <button type="submit" className="btn btn-success">
//             {mode === "signup" ? "Sign Up" : "Login"}
//           </button>

//           <p
//             style={{ cursor: "pointer", color: "#007bff", marginTop: "1rem" }}
//             onClick={() => setMode(mode === "signup" ? "login" : "signup")}
//           >
//             {mode === "signup"
//               ? "Already have an account? Click to login"
//               : "New here? Click to sign up"}
//           </p>
//         </form>
//       )}
//     </div>
//   );
// };

// export default SignUp;
