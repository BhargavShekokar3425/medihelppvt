import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBackendContext } from "../contexts/BackendContext";
import LoginHelper from '../components/LoginHelper';

const SignUp = () => {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({
    role: "Patient",
    username: "",
    name: "",
    dob: "",
    address: "",
    contact: "",
    bloodGroup: "",
    gender: "",
    allergies: ""
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { register, login, currentUser } = useBackendContext();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/profile');
    }
  }, [currentUser, navigate]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (formStep === 1) {
      if (!email || !password) {
        setFormError("Email and password are required");
        return;
      }
    } else if (formStep === 2) {
      if (!formData.name || !formData.role) {
        setFormError("Name and role are required");
        return;
      }
    }
    setFormError("");
    setFormStep(formStep + 1);
  };

  const prevStep = () => {
    setFormStep(formStep - 1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    
    try {
      if (!email || !password || !formData.name) {
        throw new Error("Email, password and name are required");
      }
      
      console.log("Registering with:", { email, password, userType: formData.role.toLowerCase(), ...formData });
      
      await register(email, password, formData.role.toLowerCase(), formData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setFormError(error.message || "An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate("/profile");
    } catch (error) {
      console.error("Login error:", error);
      setFormError(error.message || "An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSignupForm = () => {
    if (success) {
      return (
        <div className="text-center p-4">
          <div className="mb-4">
            <i className="fas fa-check-circle text-success" style={{ fontSize: "4rem" }}></i>
          </div>
          <h3>Registration Successful!</h3>
          <p>Redirecting to your profile...</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSignup}>
        {formStep === 1 && (
          <>
            <div className="mb-3">
              <label>Email:</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label>Password:</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button 
              type="button" 
              className="btn btn-primary w-100 gradient-background border-0"
              onClick={nextStep}
            >
              Next
            </button>
          </>
        )}

        {formStep === 2 && (
          <>
            <div className="mb-3">
              <label>Name:</label>
              <input 
                type="text" 
                name="name" 
                className="form-control" 
                onChange={handleInput} 
                required 
              />
            </div>
            
            <div className="mb-3">
              <label>Role:</label>
              <select 
                className="form-control" 
                name="role" 
                onChange={handleInput} 
                required
              >
                <option value="">Select Role</option>
                <option>Patient</option>
                <option>Doctor</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Username:</label>
              <input 
                type="text" 
                name="username" 
                className="form-control" 
                onChange={handleInput} 
                required 
              />
            </div>

            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-outline-secondary flex-grow-1"
                onClick={prevStep}
              >
                Back
              </button>
              <button 
                type="button" 
                className="btn btn-primary flex-grow-1 gradient-background border-0"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </>
        )}

        {formStep === 3 && (
          <>
            <div className="mb-3">
              <label>Date of Birth:</label>
              <input 
                type="date" 
                name="dob" 
                className="form-control" 
                onChange={handleInput} 
                required 
              />
            </div>

            <div className="mb-3">
              <label>Gender:</label>
              <select 
                name="gender" 
                className="form-control" 
                onChange={handleInput} 
                required
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Contact Number:</label>
              <input 
                type="tel" 
                name="contact" 
                className="form-control" 
                onChange={handleInput} 
                required 
              />
            </div>

            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-outline-secondary flex-grow-1"
                onClick={prevStep}
              >
                Back
              </button>
              <button 
                type="button" 
                className="btn btn-primary flex-grow-1 gradient-background border-0"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </>
        )}

        {formStep === 4 && (
          <>
            <div className="mb-3">
              <label>Address:</label>
              <textarea 
                name="address" 
                className="form-control" 
                onChange={handleInput} 
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label>Blood Group:</label>
              <select 
                name="bloodGroup" 
                className="form-control" 
                onChange={handleInput} 
                required
              >
                <option value="">Select Blood Group</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Existing Allergies:</label>
              <textarea 
                name="allergies" 
                className="form-control" 
                onChange={handleInput}
                placeholder="Optional"
              ></textarea>
            </div>

            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-outline-secondary flex-grow-1"
                onClick={prevStep}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="btn btn-success flex-grow-1 gradient-background border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                Register
              </button>
            </div>
          </>
        )}
      </form>
    );
  };

  return (
    <div className="d-flex justify-content-center align-items-center gradient-bg" style={{ minHeight: "calc(100vh - 120px)", padding: "20px" }}>
      <div className="card p-4 shadow rounded w-100" style={{ maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 className="text-center mb-4">
          <span style={{ color: "#5aa3e7" }}>Medi</span>
          <span style={{ color: "#d73434" }}>Help</span>
        </h2>
        
        {formError && (
          <div className="alert alert-danger" role="alert">{formError}</div>
        )}
        
        {mode === "login" && <LoginHelper />}
        
        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label>Email:</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>Password:</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 gradient-background border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Login
            </button>
          </form>
        ) : (
          <>
            {formStep <= 4 && (
              <div className="mb-4">
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{width: `${formStep * 25}%`}}
                    aria-valuenow={formStep * 25} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <small>Account</small>
                  <small>Basic Info</small>
                  <small>Details</small>
                  <small>Medical</small>
                </div>
              </div>
            )}
            {renderSignupForm()}
          </>
        )}

        <p
          className="text-center mt-3"
          style={{ cursor: "pointer", color: "#007bff" }}
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
        >
          {mode === "signup"
            ? "Already have an account? Click to login"
            : "New here? Click to sign up"}
        </p>
      </div>
    </div>
  );
};

export default SignUp;
