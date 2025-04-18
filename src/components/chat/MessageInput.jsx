import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeout = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Common emojis for quick access
  const commonEmojis = ['😊', '👍', '❤️', '😂', '🙏', '👋', '😷', '🩺', '💊', '🏥'];

  // Resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle message change and trigger typing events
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    // Trigger typing indicator
    onTyping(true);
    
    // Set timeout to stop typing indicator
    typingTimeout.current = setTimeout(() => {
      onTyping(false);
    }, 3000);
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage && attachments.length === 0) return;
    
    try {
      setIsSending(true);
      await onSendMessage(trimmedMessage, attachments);
      setMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);
      
      // Clear typing indicator
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      onTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newAttachments = files.map(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      
      return {
        file,
        type: file.type,
        name: file.name,
        size: file.size,
        url: isImage || isVideo || isAudio ? URL.createObjectURL(file) : null
      };
    });
    
    setAttachments([...attachments, ...newAttachments]);
    
    // Reset file input
    e.target.value = null;
  };

  // Remove attachment
  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    
    // Revoke URL if it was created
    if (newAttachments[index].url) {
      URL.revokeObjectURL(newAttachments[index].url);
    }
    
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Handle recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audioFile = new File([audioBlob], "voice-message.webm", { 
          type: "audio/webm" 
        });
        
        setAttachments([...attachments, {
          file: audioFile,
          type: 'audio/webm',
          name: 'Voice Message',
          size: audioBlob.size,
          url: audioUrl
        }]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to start recording. Please check your microphone permissions.');
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setIsRecording(false);
    }
  };

  // Insert emoji into message
  const insertEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="message-input-container">
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((attachment, index) => (
            <div key={index} className="attachment-preview">
              {attachment.type.startsWith('image/') ? (
                <div className="image-preview">
                  <img src={attachment.url} alt={attachment.name} />
                </div>
              ) : attachment.type.startsWith('video/') ? (
                <div className="video-preview">
                  <video src={attachment.url} />
                  <i className="fas fa-play-circle"></i>
                </div>
              ) : attachment.type.startsWith('audio/') ? (
                <div className="audio-preview">
                  <i className="fas fa-music"></i>
                  <span className="file-name">{attachment.name}</span>
                </div>
              ) : (
                <div className="file-preview">
                  <i className="fas fa-file"></i>
                  <span className="file-name">{attachment.name}</span>
                </div>
              )}
              <button 
                className="remove-attachment"
                onClick={() => removeAttachment(index)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-picker-header">
            <span>Quick Reactions</span>
            <button 
              className="close-emoji-picker"
              onClick={() => setShowEmojiPicker(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="emoji-grid">
            {commonEmojis.map((emoji, index) => (
              <button 
                key={index}
                className="emoji-button" 
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isRecording ? (
        <div className="recording-interface">
          <div className="recording-indicator">
            <i className="fas fa-microphone recording-icon"></i>
            <span className="recording-text">Recording...</span>
          </div>
          <div className="recording-actions">
            <button className="cancel-recording" onClick={cancelRecording}>
              <i className="fas fa-trash"></i>
              <span>Cancel</span>
            </button>
            <button className="stop-recording" onClick={stopRecording}>
              <i className="fas fa-stop"></i>
              <span>Stop</span>
            </button>
          </div>
        </div>
      ) : (
        <form className="message-form" onSubmit={handleSubmit}>
          <button 
            type="button" 
            className="attachment-button"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fas fa-paperclip"></i>
          </button>
          
          <button 
            type="button" 
            className="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <i className="far fa-smile"></i>
          </button>
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            placeholder="Type a message"
            className="message-textarea"
            rows="1"
            onKeyDown={e => {
              // Submit on Enter (without Shift)
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
          />
          
          {message.trim() || attachments.length > 0 ? (
            <button 
              type="submit" 
              className="send-button"
              disabled={isSending}
            >
              {isSending ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          ) : (
            <button 
              type="button" 
              className="voice-button"
              onClick={startRecording}
            >
              <i className="fas fa-microphone"></i>
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default MessageInput;
