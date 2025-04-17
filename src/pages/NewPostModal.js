import React, { useState } from 'react';

const NewPostModal = ({ communityType, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [role, setRole] = useState('');

  const handleSubmit = () => {
    const newPost = {
      title,
      body,
      tags,
      author: `${role} (${role === 'Patient' ? 'Patient' : role})`,
      communityType,
      createdAt: new Date()
    };
    onSubmit(newPost);
    onClose();
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
        width: '400px',
        opacity: 1 // Fully opaque modal
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#343a40' }}>Create New Post</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '15px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            fontSize: '16px'
          }}
        />
        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
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
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags.join(',')}
          onChange={(e) => setTags(e.target.value.split(','))}
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
          <option value="Patient">Patient</option>
          <option value="Doctor">Doctor</option>
          <option value="Pharmacist">Pharmacist</option>
        </select>
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
          Create Post
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

export default NewPostModal;
