import React from 'react';
import { Link } from 'react-router-dom';

const ForumHome = () => {
  return (
    <div>
      <h1>Community Forums</h1>
      <div>
        <Link to="/medical-forum">
          <button>Medical Q&A</button>
        </Link>
        <Link to="/pharmacy-forum">
          <button>Pharmacy Forum</button>
        </Link>
      </div>
    </div>
  );
};

export default ForumHome;
