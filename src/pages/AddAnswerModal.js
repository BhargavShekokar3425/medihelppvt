import React, { useState } from 'react';

const AddAnswerModal = ({ postId, onClose, onSubmit }) => {
  const [answer, setAnswer] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = () => {
    if (answer.trim() && name.trim() && role) {
      const newAnswer = {
        body: answer,
        author: `${name} (${role})`,
        badge: role === 'Doctor' ? 'Doctor Verified Answer' 
              : role === 'Pharmacist' ? 'Pharmacist Verified Answer' 
              : null, // No badge for Patient
        createdAt: new Date()
      };
      onSubmit(newAnswer);
      setAnswer('');
      setName('');
      setRole('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        width: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#343a40' }}>Add Answer</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '15px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            fontSize: '16px'
          }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '15px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            fontSize: '16px'
          }}
        >
          <option value="">Select Role</option>
          <option value="Doctor">Doctor</option>
          <option value="Pharmacist">Pharmacist</option>
          <option value="Patient">Patient</option>
        </select>
        <textarea
          placeholder="Write your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '15px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            fontSize: '16px',
            resize: 'none',
            height: '100px'
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          Submit Answer
        </button>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddAnswerModal;
