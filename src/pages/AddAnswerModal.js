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
              : null,
        createdAt: new Date()
      };
      onSubmit(newAnswer);
      setAnswer('');
      setName('');
      setRole('');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>🩺 Add Your Answer</h2>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
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
          style={styles.textarea}
        />

        <button
          onClick={handleSubmit}
          style={{ ...styles.button, backgroundColor: '#28a745' }}
        >
          Submit Answer
        </button>

        <button
          onClick={onClose}
          style={{ ...styles.button, backgroundColor: '#dc3545', marginTop: '10px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  modal: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center'
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
    fontWeight: 600
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  textarea: {
    width: '100%',
    height: '120px',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '15px',
    border: '1px solid #ccc',
    resize: 'vertical',
    marginBottom: '15px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  }
};

export default AddAnswerModal;

// import React, { useState } from 'react';

// const AddAnswerModal = ({ postId, onClose, onSubmit }) => {
//   const [answer, setAnswer] = useState('');
//   const [name, setName] = useState('');
//   const [role, setRole] = useState('');

//   const handleSubmit = () => {
//     if (answer.trim() && name.trim() && role) {
//       const newAnswer = {
//         body: answer,
//         author: `${name} (${role})`,
//         badge: role === 'Doctor' ? 'Doctor Verified Answer' 
//               : role === 'Pharmacist' ? 'Pharmacist Verified Answer' 
//               : null, // No badge for Patient
//         createdAt: new Date()
//       };
//       onSubmit(newAnswer);
//       setAnswer('');
//       setName('');
//       setRole('');
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       width: '100%',
//       height: '100%',
//       backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       zIndex: 1000
//     }}>
//       <div style={{
//         backgroundColor: '#f8f9fa',
//         padding: '30px',
//         borderRadius: '8px',
//         boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//         width: '400px'
//       }}>
//         <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#343a40' }}>Add Answer</h2>
//         <input
//           type="text"
//           placeholder="Your Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           style={{
//             width: '100%',
//             marginBottom: '15px',
//             padding: '10px',
//             borderRadius: '4px',
//             border: '1px solid #ced4da',
//             fontSize: '16px'
//           }}
//         />
//         <select
//           value={role}
//           onChange={(e) => setRole(e.target.value)}
//           style={{
//             width: '100%',
//             marginBottom: '15px',
//             padding: '10px',
//             borderRadius: '4px',
//             border: '1px solid #ced4da',
//             fontSize: '16px'
//           }}
//         >
//           <option value="">Select Role</option>
//           <option value="Doctor">Doctor</option>
//           <option value="Pharmacist">Pharmacist</option>
//           <option value="Patient">Patient</option>
//         </select>
//         <textarea
//           placeholder="Write your answer here..."
//           value={answer}
//           onChange={(e) => setAnswer(e.target.value)}
//           style={{
//             width: '100%',
//             marginBottom: '15px',
//             padding: '10px',
//             borderRadius: '4px',
//             border: '1px solid #ced4da',
//             fontSize: '16px',
//             resize: 'none',
//             height: '100px'
//           }}
//         />
//         <button
//           onClick={handleSubmit}
//           style={{
//             width: '100%',
//             padding: '10px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             fontSize: '16px',
//             cursor: 'pointer',
//             marginBottom: '10px'
//           }}
//         >
//           Submit Answer
//         </button>
//         <button
//           onClick={onClose}
//           style={{
//             width: '100%',
//             padding: '10px',
//             backgroundColor: '#6c757d',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             fontSize: '16px',
//             cursor: 'pointer'
//           }}
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AddAnswerModal;
