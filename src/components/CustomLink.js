import React from 'react';

// Custom Link component that doesn't rely on Router context
const CustomLink = ({ to, children, className }) => {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.href = to;
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default CustomLink;
