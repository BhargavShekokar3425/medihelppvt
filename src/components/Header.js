import React from "react";

const Header = () => {
  return (
    <header className="blog-header py-3">
    <div className="row flex-nowrap justify-content-between align-items-center">
      <div className="col-4 pt-1">
         <a className="btn btn-sm btn-outline-secondary spl_text" href="https://example.com">Sign up</a>
      </div>
      <div className="col-4 text-center">
      <a className="blog-header-logo text-dark" href="https://example.com">
        <span style={{ color: "#5aa3e7" }}>Medi</span>
        <span style={{ color: "#d73434" }}>Help</span>
     </a>

      </div>
      <div className="col-4 d-flex justify-content-end align-items-center ">
       
        
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="50" height="30" ><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"/><a className="text-muted" href="https://example.com" aria-label="User Profile"></a></svg>
      
       
      </div>
    </div>
  </header>
  
  );
};

export default Header;
