import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  limit,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase/config";

export const chatService = {
  // Get conversations for a user
  getConversations: async (userId) => {
    try {
      // Query conversations where user is a participant
      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const conversations = [];
      
      for (const conversationDoc of querySnapshot.docs) {
        const conversationData = conversationDoc.data();
        const conversationId = conversationDoc.id;
        
        // Get the other participant's details
        const otherParticipantId = conversationData.participants.find(id => id !== userId);
        const otherParticipantDoc = await getDoc(doc(db, "users", otherParticipantId));
        
        conversations.push({
          id: conversationId,
          lastMessage: conversationData.lastMessage,
          lastUpdated: conversationData.lastUpdated,
          otherParticipant: {
            id: otherParticipantId,
            ...otherParticipantDoc.data()
          }
        });
      }
      
      // Sort by last updated time
      return conversations.sort((a, b) => 
        b.lastUpdated?.toDate?.() - a.lastUpdated?.toDate?.() || 0
      );
    } catch (error) {
      console.error("Get conversations error:", error);
      throw error;
    }
  },
  
  // Get or create a conversation between two users
  getOrCreateConversation: async (userId1, userId2) => {
    try {
      // Create a unique ID for the conversation using both user IDs (sorted to ensure consistency)
      const participants = [userId1, userId2].sort();
      const conversationId = `${participants[0]}_${participants[1]}`;
      
      // Check if conversation exists using the unique ID
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (conversationDoc.exists()) {
        // Conversation exists, return it
        return {
          id: conversationId,
          ...conversationDoc.data()
        };
      }
      
      // Get user information for both participants
      const user1Doc = await getDoc(doc(db, "users", userId1));
      const user2Doc = await getDoc(doc(db, "users", userId2));
      
      if (!user1Doc.exists() || !user2Doc.exists()) {
        throw new Error("One or both users do not exist");
      }
      
      // Create new conversation with metadata
      const newConversation = {
        participants,
        participantsInfo: {
          [userId1]: {
            name: user1Doc.data().name || "Unknown User",
            avatar: user1Doc.data().photoURL || null,
            userType: user1Doc.data().userType || "patient"
          },
          [userId2]: {
            name: user2Doc.data().name || "Unknown User",
            avatar: user2Doc.data().photoURL || null,
            userType: user2Doc.data().userType || "doctor"
          }
        },
        lastMessage: null,
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0
        }
      };
      
      // Set the document with the custom ID
      await setDoc(conversationRef, newConversation);
      
      // Add this conversation to the users' conversation lists
      await updateDoc(doc(db, "users", userId1), {
        conversations: arrayUnion(conversationId)
      });
      
      await updateDoc(doc(db, "users", userId2), {
        conversations: arrayUnion(conversationId)
      });
      
      return {
        id: conversationId,
        ...newConversation
      };
    } catch (error) {
      console.error("Get or create conversation error:", error);
      throw error;
    }
  },
  
  // Get messages for a conversation with pagination
  getMessages: async (conversationId, pageSize = 20, lastMessageTimestamp = null) => {
    try {
      let messagesQuery;
      
      if (lastMessageTimestamp) {
        messagesQuery = query(
          collection(db, "conversations", conversationId, "messages"),
          orderBy("createdAt", "desc"),
          where("createdAt", "<", lastMessageTimestamp),
          limit(pageSize)
        );
      } else {
        messagesQuery = query(
          collection(db, "conversations", conversationId, "messages"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(messagesQuery);
      
      // Convert to array and reverse to get chronological order
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      
      return messages;
    } catch (error) {
      console.error("Get messages error:", error);
      throw error;
    }
  },
  
  // Send a new message
  sendMessage: async (conversationId, senderId, text, attachments = []) => {
    try {
      // Get the conversation to check if it exists and get the other participant
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error("Conversation not found");
      }
      
      const conversationData = conversationDoc.data();
      
      // Find the recipient (the other participant)
      const recipientId = conversationData.participants.find(id => id !== senderId);
      
      const messageData = {
        sender: senderId,
        text,
        attachments,
        read: false,
        readBy: [senderId],
        createdAt: serverTimestamp()
      };
      
      // Add message to the conversation's messages subcollection
      const messageRef = await addDoc(
        collection(db, "conversations", conversationId, "messages"),
        messageData
      );
      
      // Update conversation with last message info
      await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: senderId,
        [`unreadCount.${recipientId}`]: conversationData.unreadCount[recipientId] + 1
      });
      
      // Add message ID to the message data
      const newMessage = {
        id: messageRef.id,
        ...messageData
      };
      
      return newMessage;
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  },
  
  // Mark messages as read
  markMessagesAsRead: async (conversationId, userId) => {
    try {
      // Get the conversation
      const conversationRef = doc(db, "conversations", conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error("Conversation not found");
      }
      
      // Get unread messages from the other participant
      const q = query(
        collection(db, "conversations", conversationId, "messages"),
        where("sender", "!=", userId),
        where("readBy", "array-contains-any", [userId])
      );
      
      const querySnapshot = await getDocs(q);
      
      // Mark each message as read
      const updatePromises = querySnapshot.docs.map(messageDoc => 
        updateDoc(doc(db, "conversations", conversationId, "messages", messageDoc.id), {
          read: true,
          readBy: arrayUnion(userId)
        })
      );
      
      // Reset unread count for this user
      updatePromises.push(
        updateDoc(conversationRef, {
          [`unreadCount.${userId}`]: 0
        })
      );
      
      await Promise.all(updatePromises);
      
      return true;
    } catch (error) {
      console.error("Mark messages as read error:", error);
      throw error;
    }
  },
  
  // Subscribe to new messages in a conversation
  subscribeToMessages: (conversationId, callback) => {
    if (!conversationId) {
      console.error("No conversation ID provided");
      return () => {}; // Return empty function if no ID
    }
    
    const messagesQuery = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );
    
    return onSnapshot(messagesQuery, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      callback(messages);
    }, error => {
      console.error("Messages subscription error:", error);
    });
  },

  // Subscribe to conversations list in real-time
  subscribeToConversations: (userId, callback) => {
    if (!userId) {
      console.error("No user ID provided");
      return () => {}; // Return empty function if no ID
    }
    
    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc")
    );
    
    return onSnapshot(conversationsQuery, async (querySnapshot) => {
      const conversations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      callback(conversations);
    }, error => {
      console.error("Conversations subscription error:", error);
    });
  },
  
  // Get a list of users who can be messaged
  getPotentialContacts: async (userId, userType) => {
    try {
      // Different user types that can be contacted based on the current user's type
      const contactUserTypes = {
        patient: ["doctor", "pharmacy"],
        doctor: ["patient", "doctor", "pharmacy"],
        pharmacy: ["patient", "doctor"]
      };
      
      // Get contacts based on user type
      const relevantTypes = contactUserTypes[userType] || ["patient", "doctor", "pharmacy"];
      
      // Query users excluding the current user
      const usersQuery = query(
        collection(db, "users"),
        where("userType", "in", relevantTypes)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      // Format user data and exclude current user
      return querySnapshot.docs
        .filter(doc => doc.id !== userId)
        .map(doc => ({
          id: doc.id,
          name: doc.data().name || "Unknown User",
          avatar: doc.data().photoURL || null,
          userType: doc.data().userType || "patient",
          specialization: doc.data().specialization || null,
          address: doc.data().address || null,
          online: doc.data().online || false,
          lastSeen: doc.data().lastSeen || null
        }));
    } catch (error) {
      console.error("Get potential contacts error:", error);
      throw error;
    }
  },
  
  // Subscribe to user online status
  subscribeToUserStatus: (userId, callback) => {
    return onSnapshot(doc(db, "users", userId), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        callback({
          id: userId,
          online: userData.online || false,
          lastSeen: userData.lastSeen
        });
      }
    });
  },
  
  // Update user online status
  updateUserStatus: async (userId, isOnline) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        online: isOnline,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error("Update user status error:", error);
      throw error;
    }
  }
};

export default chatService;
