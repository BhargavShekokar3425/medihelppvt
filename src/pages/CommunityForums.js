import React, { useState, useEffect, useCallback } from 'react';
import { useBackendContext } from '../contexts/BackendContext';
import NewPostModal from './NewPostModal';
import AddAnswerModal from './AddAnswerModal';
import CommentSection from './CommentSection';

const CommunityForums = () => {
  const { apiService, currentUser } = useBackendContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [answerModal, setAnswerModal] = useState({ show: false, postId: null });

  // Load posts from API
  const loadPosts = useCallback(async (search = '') => {
    try {
      setLoading(true);
      if (!apiService) return;
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiService.get(`/forum${params}`);
      const list = Array.isArray(data) ? data : (data.posts || []);
      setPosts(list.map(p => ({ ...p, showAnswers: false })));
    } catch (err) {
      console.error('Error loading forum posts:', err);
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPosts(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, loadPosts]);

  const toggleUpvote = async (id) => {
    try {
      if (!apiService) return;
      const updated = await apiService.post(`/forum/${id}/upvote`);
      setPosts(prev => prev.map(p => p.id === id ? { ...updated, showAnswers: p.showAnswers } : p));
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const toggleDownvote = async (id) => {
    try {
      if (!apiService) return;
      const updated = await apiService.post(`/forum/${id}/downvote`);
      setPosts(prev => prev.map(p => p.id === id ? { ...updated, showAnswers: p.showAnswers } : p));
    } catch (err) {
      console.error('Downvote error:', err);
    }
  };

  const addAnswer = async (postId, answer) => {
    try {
      if (!apiService) return;
      const updated = await apiService.post(`/forum/${postId}/answers`, { body: answer.body || answer });
      setPosts(prev => prev.map(p => p.id === postId ? { ...updated, showAnswers: true } : p));
    } catch (err) {
      console.error('Add answer error:', err);
    }
  };

  const addComment = async (postId, comment) => {
    try {
      if (!apiService) return;
      const updated = await apiService.post(`/forum/${postId}/comments`, { body: comment.body || comment });
      setPosts(prev => prev.map(p => p.id === postId ? { ...updated, showAnswers: p.showAnswers } : p));
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  const toggleAnswersVisibility = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, showAnswers: !p.showAnswers } : p));
  };

  const handleCreatePost = async (newPost) => {
    try {
      if (!apiService) return;
      const created = await apiService.post('/forum', {
        title: newPost.title,
        body: newPost.body,
        tags: newPost.tags,
      });
      setPosts(prev => [{ ...created, showAnswers: false }, ...prev]);
    } catch (err) {
      console.error('Create post error:', err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark" style={{ marginBottom: '32px' }}>
        <div className="col px-0" style={{ color: 'black' }}>
          <h1 className="display-4 font-italic">DocExchange</h1>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="form-control mb-3"
      />

      {currentUser && (
        <button className="btn btn-primary mb-3 gradient-bg" onClick={() => setShowModal(true)}>
          Create New Post
        </button>
      )}
      {!currentUser && (
        <p className="text-muted mb-3">Please log in to create posts, vote, or comment.</p>
      )}

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="alert alert-info">No posts found. Be the first to start a discussion!</div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{post.title}</h5>
              <p className="card-text">{post.body}</p>
              <p><strong>Tags:</strong> {(post.tags || []).join(', ')}</p>
              <p><strong>Author:</strong> {post.author}</p>
              <div>
                <button
                  className={`btn ${post.userUpvoted ? 'btn-success' : 'btn-outline-success'} me-2`}
                  onClick={() => toggleUpvote(post.id)}
                  disabled={!currentUser}
                >
                  Upvote ({post.upvotes})
                </button>
                <button
                  className={`btn ${post.userDownvoted ? 'btn-danger' : 'btn-outline-danger'} me-2`}
                  onClick={() => toggleDownvote(post.id)}
                  disabled={!currentUser}
                >
                  Downvote ({post.downvotes})
                </button>
                {currentUser && (
                  <button className="btn btn-secondary" onClick={() => setAnswerModal({ show: true, postId: post.id })}>
                    Add Answer
                  </button>
                )}
              </div>

              {(post.answers || []).length > 0 && (
                <div className="mt-3">
                  <button className="btn btn-info" onClick={() => toggleAnswersVisibility(post.id)}>
                    {post.showAnswers ? 'Hide Answers' : `View Answers (${post.answers.length})`}
                  </button>
                  {post.showAnswers && (
                    <ul className="list-group mt-2">
                      {post.answers.map((answer, index) => (
                        <li key={answer.id || index} className="list-group-item">
                          <p>{answer.body}</p>
                          <small>
                            <strong>{answer.author}</strong>
                            {answer.badge && <span className="badge bg-primary ms-2">{answer.badge}</span>}
                          </small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <CommentSection
                comments={(post.comments || []).map(c => ({
                  ...c,
                  createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
                }))}
                onAddComment={(comment) => addComment(post.id, comment)}
              />
            </div>
          </div>
        ))
      )}

      {showModal && (
        <NewPostModal
          onClose={() => setShowModal(false)}
          onSubmit={(newPost) => {
            handleCreatePost(newPost);
            setShowModal(false);
          }}
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