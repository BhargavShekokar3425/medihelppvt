import React, { useState } from 'react';

const Thread = ({ thread, addAnswer }) => {
  const [newAnswer, setNewAnswer] = useState('');
  const [role, setRole] = useState('');

  const handleAddAnswer = () => {
    const answer = {
      body: newAnswer,
      role,
      badge: role === 'Doctor' ? 'Doctor Verified Answer' 
            : role === 'Pharmacist' ? 'Pharmacist Verified Answer' 
            : null // General User or unverified
    };
    addAnswer(thread.id, answer);
    setNewAnswer('');
    setRole('');
  };

  return (
    <div>
      <h2>{thread.title}</h2>
      <p>{thread.body}</p>
      <p><strong>Posted by:</strong> {thread.author}</p>
      <div>
        {(thread.answers || []).map((answer, index) => (
          <div key={index}>
            <p>{answer.body}</p>
            {answer.badge ? (
              <p style={{ color: 'green' }}><strong>{answer.badge}</strong></p>
            ) : (
              <p style={{ fontSize: '0.9em', color: 'gray' }}>
                Note: This response is from a community member and not a verified medical professional.
              </p>
            )}
          </div>
        ))}
      </div>
      <textarea
        placeholder="Add your answer..."
        value={newAnswer}
        onChange={(e) => setNewAnswer(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <select 
        value={role} 
        onChange={(e) => setRole(e.target.value)} 
        style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        <option value="">Select Role</option>
        <option value="Doctor">Doctor</option>
        <option value="Pharmacist">Pharmacist</option>
        <option value="User">General User</option>
      </select>
      <button 
        onClick={handleAddAnswer} 
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Submit Answer
      </button>
    </div>
  );
};

export default Thread;
