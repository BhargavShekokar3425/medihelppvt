import React, { useState } from 'react';

const CommentSection = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false); // Track whether comments are visible

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment({ body: newComment, createdAt: new Date() });
      setNewComment('');
    }
  };

  return (
    <div style={{ marginTop: '15px' }}>
      <h4>Comments</h4>
      {comments.length > 0 ? (
        <div>
          <button
            onClick={() => setShowComments(!showComments)}
            style={{
              marginBottom: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            {showComments ? 'Hide All Comments...' : `View All Comments (${comments.length})`}
          </button>
          {showComments && (
            <div style={{ marginTop: '10px', paddingLeft: '15px' }}>
              {comments.map((comment, index) => (
                <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
                  <p style={{ marginBottom: '5px', fontSize: '14px', color: '#495057' }}>{comment.body}</p>
                  <p style={{ fontSize: '0.8em', color: '#6c757d' }}>
                    Commented on {comment.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: '#6c757d' }}>No comments yet!</p>
      )}
      <textarea
        placeholder="Write a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        style={{
          width: '100%',
          marginBottom: '10px',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #ced4da',
          fontSize: '16px',
          resize: 'none',
          height: '60px'
        }}
      />
      <button
        onClick={handleAddComment}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Add Comment
      </button>
    </div>
  );
};

export default CommentSection;
