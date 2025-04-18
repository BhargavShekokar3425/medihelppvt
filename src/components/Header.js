import React from "react";
import { Link } from "react-router-dom";
import AuthStatus from "./AuthStatus";

const Header = () => {
  return (
    <header className="blog-header py-3">
      <div className="row flex-nowrap justify-content-between align-items-center">
        
        <div className="col-4 pt-1">
          <Link to="/" className="text-decoration-none">
            <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>Welcome to MediHelp</span>
          </Link>
        </div>

        <div className="col-4 text-center">
          <Link className="blog-header-logo text-dark text-decoration-none" to="/">
            <span style={{ color: "#5aa3e7" }}>Medi</span>
            <span style={{ color: "#d73434" }}>Help</span>
          </Link>
        </div>

        <div className="col-4 d-flex justify-content-end align-items-center">
          <AuthStatus />
        </div>
        
      </div>
    </header>
  );
};

export default Header;





