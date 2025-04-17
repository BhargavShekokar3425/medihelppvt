import React, { useState } from 'react';
import NewPostModal from './NewPostModal';
import AddAnswerModal from './AddAnswerModal';
import CommentSection from './CommentSection'; // Import the new CommentSection component

const CommunityForums = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Persistent cough for 3 weeks - should I be concerned?",
      body: "I've had a dry cough that won't go away since my cold cleared up. No fever but sometimes chest tightness. I'm a 21-year-old non-smoker. Is this normal post-viral or should I get checked?",
      tags: ["cough", "chest tightness"],
      author: "Devesh Shekokar (Patient)",
      upvotes: 10,
      downvotes: 2,
      userUpvoted: false,
      userDownvoted: false,
      answers: [
        {
          body: "You should consult a doctor if the cough persists for more than 3 weeks.",
          author: "Dr. Nitish Bhambhare (Doctor)",
          badge: "Doctor Verified Answer",
          createdAt: new Date()
        }
      ],
      showAnswers: false, // Track whether answers are visible
      comments: [] // Initialize comments for the post
    },
    {
      id: 2,
      title: "Can I take paracetamol with my blood pressure medication?",
      body: "I'm on amlodipine 5mg daily. Got fever today (38°C). Is it safe to take 500mg paracetamol or should I ask my doctor first?",
      tags: ["paracetamol", "blood pressure"],
      author: "Saher Dev (Patient)",
      upvotes: 5,
      downvotes: 1,
      userUpvoted: false,
      userDownvoted: false,
      answers: [],
      showAnswers: false,
      comments: [] // Initialize comments for the post
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [answerModal, setAnswerModal] = useState({ show: false, postId: null });

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleUpvote = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        const isUpvoted = !post.userUpvoted;
        const isDownvoted = post.userDownvoted;
        return {
          ...post,
          upvotes: isUpvoted ? post.upvotes + 1 : post.upvotes - 1,
          downvotes: isDownvoted ? post.downvotes - 1 : post.downvotes,
          userUpvoted: isUpvoted,
          userDownvoted: false // Reset downvote if upvoted
        };
      }
      return post;
    }));
  };

  const toggleDownvote = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        const isDownvoted = !post.userDownvoted;
        const isUpvoted = post.userUpvoted;
        return {
          ...post,
          downvotes: isDownvoted ? post.downvotes + 1 : post.downvotes - 1,
          upvotes: isUpvoted ? post.upvotes - 1 : post.upvotes,
          userDownvoted: isDownvoted,
          userUpvoted: false // Reset upvote if downvoted
        };
      }
      return post;
    }));
  };

  const addAnswer = (postId, answer) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          answers: [...(post.answers || []), answer]
        };
      }
      return post;
    }));
  };

  const toggleAnswersVisibility = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          showAnswers: !post.showAnswers
        };
      }
      return post;
    }));
  };

  const addComment = (postId, comment) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));
  };

  return (
    <div>
      <h1>Community Forums</h1>
      <input
        type="text"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '20px', width: '100%', padding: '10px' }}
      />
      <button onClick={() => setShowModal(true)} style={{ marginBottom: '20px' }}>
        Create New Post
      </button>
      {filteredPosts.map(post => (
        <div
          key={post.id}
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{ color: '#343a40' }}>{post.title}</h3>
          <p style={{ color: '#495057' }}>{post.body}</p>
          <p><strong>Tags:</strong> {post.tags.join(', ')}</p>
          <p><strong>Author:</strong> {post.author}</p>
          <div>
            <button
              onClick={() => toggleUpvote(post.id)}
              style={{
                backgroundColor: post.userUpvoted ? 'lightgreen' : 'white',
                border: '1px solid #ccc',
                padding: '5px 10px',
                marginRight: '10px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Upvote ({post.upvotes})
            </button>
            <button
              onClick={() => toggleDownvote(post.id)}
              style={{
                backgroundColor: post.userDownvoted ? 'lightcoral' : 'white',
                border: '1px solid #ccc',
                padding: '5px 10px',
                marginRight: '10px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Downvote ({post.downvotes})
            </button>
            <button
              onClick={() => setAnswerModal({ show: true, postId: post.id })}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Add Answer
            </button>
          </div>
          {(post.answers || []).length > 0 ? (
            <div>
              <button
                onClick={() => toggleAnswersVisibility(post.id)}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                {post.showAnswers ? 'Hide All Answers...' : `View All Answers (${post.answers.length})`}
              </button>
              {post.showAnswers && (
                <div style={{ marginTop: '10px', paddingLeft: '15px' }}>
                  {post.answers.map((answer, index) => (
                    <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
                      <p style={{ marginBottom: '5px' }}>{answer.body}</p>
                      {answer.badge && (
                        <p style={{ color: 'green', fontSize: '0.9em' }}><strong>{answer.badge}</strong></p>
                      )}
                      <p style={{ fontSize: '0.8em', color: '#6c757d' }}>
                        Answered by: {answer.author} on {answer.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p style={{ marginTop: '10px', color: '#6c757d' }}>No Answers Yet!</p>
          )}
          <CommentSection
            comments={post.comments}
            onAddComment={(comment) => addComment(post.id, comment)}
          />
        </div>
      ))}
      {showModal && (
        <NewPostModal
          communityType="general"
          onClose={() => setShowModal(false)}
          onSubmit={(newPost) => setPosts([...posts, { ...newPost, id: posts.length + 1, upvotes: 0, downvotes: 0, userUpvoted: false, userDownvoted: false, answers: [], showAnswers: false, comments: [] }])}
        />
      )}
      {answerModal.show && (
        <AddAnswerModal
          postId={answerModal.postId}
          onClose={() => setAnswerModal({ show: false, postId: null })}
          onSubmit={(answer) => {
            addAnswer(answerModal.postId, answer);
            setAnswerModal({ show: false, postId: null });
          }}
        />
      )}
    </div>
  );
};

export default CommunityForums;
