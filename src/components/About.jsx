import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable About component with consistent styling
 * Can be used throughout the app to maintain visual consistency
 */
const About = ({ title = 'About', content, children, className = '' }) => {
  return (
    <div className={`p-4 mb-3 bg-light rounded ${className}`}>
      <h4 className="font-italic text-black">{title}</h4>
      {content && <p className="mb-0">{content}</p>}
      {children}
    </div>
  );
};

About.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string
};

export default About;
