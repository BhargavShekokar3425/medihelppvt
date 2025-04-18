const dbService = require('./database.service');

const forumService = {
  // Create a post
  createPost: async (postData) => {
    try {
      const { title, body, tags, userId, userType, isAnonymous } = postData;
      
      // Validate required fields
      if (!title || !body || !userId) {
        throw new Error('Missing required post fields');
      }
      
      // Get user info
      const user = await dbService.getDocument('users', userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Create post
      const post = await dbService.addDocument('posts', {
        title,
        body,
        tags: tags || [],
        authorId: userId,
        authorName: isAnonymous ? 'Anonymous' : user.name,
        authorType: user.userType,
        isAnonymous: isAnonymous || false,
        upvotes: 0,
        downvotes: 0,
        viewCount: 0,
        answerCount: 0,
        isDoctorAnswered: false,
        isPharmacyAnswered: false
      });
      
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },
  
  // Get post by ID with answers
  getPost: async (postId) => {
    try {
      // Get post
      const post = await dbService.getDocument('posts', postId);
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Get answers
      const answers = await dbService.queryDocuments(`posts/${postId}/answers`, {
        orderBy: { field: 'upvotes', direction: 'desc' }
      });
      
      // Update view count
      await dbService.updateDocument('posts', postId, {
        viewCount: dbService.fieldValues.increment(1)
      });
      
      return {
        ...post,
        answers
      };
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  },
  
  // Get all posts with filtering options
  getPosts: async (options = {}) => {
    try {
      const { tags, authorId, answered, sortBy = 'createdAt', limit = 20 } = options;
      
      let filters = [];
      
      // Apply filters
      if (tags && tags.length > 0) {
        filters.push({ field: 'tags', operator: 'array-contains-any', value: tags });
      }
      
      if (authorId) {
        filters.push({ field: 'authorId', operator: '==', value: authorId });
      }
      
      if (answered === true) {
        filters.push({ field: 'answerCount', operator: '>', value: 0 });
      }
      
      // Get posts
      const queryOptions = {
        orderBy: { field: sortBy, direction: 'desc' },
        limit
      };
      
      if (filters.length > 0) {
        queryOptions.filters = filters;
      }
      
      return await dbService.queryDocuments('posts', queryOptions);
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },
  
  // Create an answer for a post
  createAnswer: async (postId, answerData) => {
    try {
      const { body, userId, userType } = answerData;
      
      // Validate required fields
      if (!body || !userId) {
        throw new Error('Missing required answer fields');
      }
      
      // Get user info
      const user = await dbService.getDocument('users', userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Create answer
      const answer = await dbService.addDocument(`posts/${postId}/answers`, {
        body,
        authorId: userId,
        authorName: user.name,
        authorType: user.userType,
        upvotes: 0,
        downvotes: 0,
        isVerified: user.userType === 'doctor' || user.userType === 'pharmacy'
      });
      
      // Update post answer counts
      const updateData = {
        answerCount: dbService.fieldValues.increment(1)
      };
      
      // Update doctor/pharmacy answer flags if applicable
      if (user.userType === 'doctor') {
        updateData.isDoctorAnswered = true;
      } else if (user.userType === 'pharmacy') {
        updateData.isPharmacyAnswered = true;
      }
      
      await dbService.updateDocument('posts', postId, updateData);
      
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  },
  
  // Vote on a post (upvote/downvote)
  votePost: async (postId, userId, voteType) => {
    try {
      // Check if user has already voted
      const voteRef = dbService.doc(`posts/${postId}/votes/${userId}`);
      const voteDoc = await voteRef.get();
      
      // Get current vote (if any)
      const currentVote = voteDoc.exists ? voteDoc.data().type : null;
      
      // Transaction to ensure consistency
      await dbService.runTransaction(async (transaction) => {
        const postRef = dbService.doc(`posts/${postId}`);
        
        // If same vote type, remove the vote
        if (currentVote === voteType) {
          transaction.delete(voteRef);
          
          // Decrement the vote count
          if (voteType === 'upvote') {
            transaction.update(postRef, {
              upvotes: dbService.fieldValues.increment(-1)
            });
          } else {
            transaction.update(postRef, {
              downvotes: dbService.fieldValues.increment(-1)
            });
          }
        }
        // If changing vote
        else if (currentVote !== null) {
          transaction.update(voteRef, { type: voteType });
          
          // Update vote counts
          if (voteType === 'upvote') {
            transaction.update(postRef, {
              upvotes: dbService.fieldValues.increment(1),
              downvotes: dbService.fieldValues.increment(-1)
            });
          } else {
            transaction.update(postRef, {
              upvotes: dbService.fieldValues.increment(-1),
              downvotes: dbService.fieldValues.increment(1)
            });
          }
        }
        // New vote
        else {
          transaction.set(voteRef, {
            type: voteType,
            createdAt: dbService.fieldValues.serverTimestamp()
          });
          
          // Increment vote count
          if (voteType === 'upvote') {
            transaction.update(postRef, {
              upvotes: dbService.fieldValues.increment(1)
            });
          } else {
            transaction.update(postRef, {
              downvotes: dbService.fieldValues.increment(1)
            });
          }
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error voting on post:', error);
      throw error;
    }
  }
};

module.exports = forumService;
