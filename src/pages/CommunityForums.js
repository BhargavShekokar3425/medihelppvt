import React, { useState } from 'react';
import NewPostModal from './NewPostModal';
import AddAnswerModal from './AddAnswerModal';
import CommentSection from './CommentSection'; // Ensure this component exists and is functional

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
      showAnswers: false,
      comments: []
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
      comments: []
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
          userDownvoted: false
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
          userUpvoted: false
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
    <div className="container mt-5">
      <h1>Community Forums</h1>
      <input
        type="text"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="form-control mb-3"
      />
      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        Create New Post
      </button>
      {filteredPosts.map(post => (
        <div key={post.id} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">{post.title}</h5>
            <p className="card-text">{post.body}</p>
            <p><strong>Tags:</strong> {post.tags.join(', ')}</p>
            <p><strong>Author:</strong> {post.author}</p>
            <div>
              <button className="btn btn-success me-2" onClick={() => toggleUpvote(post.id)}>
                Upvote ({post.upvotes})
              </button>
              <button className="btn btn-danger me-2" onClick={() => toggleDownvote(post.id)}>
                Downvote ({post.downvotes})
              </button>
              <button className="btn btn-secondary" onClick={() => setAnswerModal({ show: true, postId: post.id })}>
                Add Answer
              </button>
            </div>
            {post.answers.length > 0 && (
              <div className="mt-3">
                <button className="btn btn-info" onClick={() => toggleAnswersVisibility(post.id)}>
                  {post.showAnswers ? 'Hide Answers' : `View Answers (${post.answers.length})`}
                </button>
                {post.showAnswers && (
                  <ul className="list-group mt-2">
                    {post.answers.map((answer, index) => (
                      <li key={index} className="list-group-item">
                        <p>{answer.body}</p>
                        <small><strong>{answer.author}</strong> - {answer.badge}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <CommentSection
              comments={post.comments}
              onAddComment={(comment) => addComment(post.id, comment)}
            />
          </div>
        </div>
      ))}
      {showModal && (
        <NewPostModal
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