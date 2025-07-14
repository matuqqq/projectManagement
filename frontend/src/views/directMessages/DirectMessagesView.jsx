import React, { useState, useEffect, useRef } from 'react';
import { 
  Hash, 
  AtSign, 
  Send, 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Settings,
  UserPlus,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';
import directMessagesService from '../../services/directMessages.service';
import './DirectMessagesView.css';

const DirectMessagesView = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Obtener usuario actual del localStorage
  const getCurrentUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    } else {
      setError('User not authenticated');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation && currentUser) {
      loadMessages(currentUser.id, selectedConversation.otherUser.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      const conversationsData = await directMessagesService.getUserConversations(currentUser.id, token);
      
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
      // No usar datos mock, mostrar error real
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (userId1, userId2) => {
    try {
      setIsLoadingMessages(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      const messagesData = await directMessagesService.getMessagesBetweenUsers(userId1, userId2, token);
      
      setMessages(messagesData);
      
      // Marcar conversación como leída
      markConversationAsRead(selectedConversation.id);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedConversation.otherUser.id,
      content: newMessage.trim()
    };

    try {
      const token = localStorage.getItem('accessToken');
      const sentMessage = await directMessagesService.sendDirectMessage(messageData, token);
      
      // Agregar mensaje a la lista local
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Actualizar último mensaje de la conversación
      updateConversationLastMessage(selectedConversation.id, sentMessage);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      const token = localStorage.getItem('accessToken');
      const updatedMessage = await directMessagesService.updateMessage(messageId, newContent, token);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent } : msg
      ));
      
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await directMessagesService.deleteMessage(messageId, token);
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
  };

  const markConversationAsRead = (conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const updateConversationLastMessage = (conversationId, message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            lastMessage: message.content, 
            lastMessageTime: new Date(message.createdAt) 
          } 
        : conv
    ));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#3ba55c';
      case 'away': return '#faa61a';
      case 'busy': return '#ed4245';
      default: return '#747f8d';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditingMessage = (message) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editContent.trim() && editingMessage) {
      editMessage(editingMessage, editContent.trim());
    }
  };

  // Verificar autenticación
  if (!currentUser) {
    return (
      <div className="dm-layout">
        <div className="auth-error">
          <h3>Authentication Required</h3>
          <p>Please log in to access direct messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dm-layout">
      {/* DM Sidebar */}
      <div className="dm-sidebar">
        <div className="dm-header">
          <div className="dm-search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Find or start a conversation"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dm-search-input"
            />
          </div>
        </div>

        <div className="dm-list">
          <div className="dm-section-header">
            <span>DIRECT MESSAGES</span>
            <Plus className="add-dm-icon" />
          </div>

          {isLoading ? (
            <div className="dm-loading">
              <div className="loading-spinner"></div>
              <span>Loading conversations...</span>
            </div>
          ) : error && conversations.length === 0 ? (
            <div className="dm-error">
              <p>Error loading conversations</p>
              <button onClick={loadConversations} className="retry-btn">
                Retry
              </button>
            </div>
          ) : (
            <div className="conversations-list">
              {filteredConversations.length === 0 ? (
                <div className="no-conversations">
                  <p>No conversations found</p>
                  <p className="no-conversations-hint">Start a new conversation to get started!</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="conversation-avatar">
                      {conversation.otherUser.avatar ? (
                        <img src={conversation.otherUser.avatar} alt={conversation.otherUser.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {conversation.otherUser.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div 
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(conversation.otherUser.status || 'offline') }}
                      />
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <span className="username">{conversation.otherUser.username}</span>
                        <span className="last-message-time">
                          {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}
                        </span>
                      </div>
                      <div className="last-message">
                        {conversation.lastMessage || 'No messages yet'}
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="unread-badge">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <AtSign className="dm-icon" />
                <span className="chat-username">{selectedConversation.otherUser.username}</span>
                <div 
                  className="user-status-dot"
                  style={{ backgroundColor: getStatusColor(selectedConversation.otherUser.status || 'offline') }}
                />
              </div>
              <div className="chat-actions">
                <Phone className="action-icon" />
                <Video className="action-icon" />
                <UserPlus className="action-icon" />
                <MoreVertical className="action-icon" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
              {isLoadingMessages ? (
                <div className="messages-loading">
                  <div className="loading-spinner"></div>
                  <span>Loading messages...</span>
                </div>
              ) : (
                <div className="messages-list">
                  <div className="conversation-start">
                    <div className="conversation-start-avatar">
                      {selectedConversation.otherUser.avatar ? (
                        <img src={selectedConversation.otherUser.avatar} alt={selectedConversation.otherUser.username} />
                      ) : (
                        <div className="avatar-placeholder large">
                          {selectedConversation.otherUser.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h2>{selectedConversation.otherUser.username}</h2>
                    <p>This is the beginning of your direct message history with <strong>@{selectedConversation.otherUser.username}</strong>.</p>
                  </div>

                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`message ${message.senderId === currentUser.id ? 'own-message' : ''}`}>
                        <div className="message-avatar">
                          {message.senderId === currentUser.id ? (
                            <div className="avatar-placeholder small">
                              {currentUser.username.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            selectedConversation.otherUser.avatar ? (
                              <img src={selectedConversation.otherUser.avatar} alt={selectedConversation.otherUser.username} />
                            ) : (
                              <div className="avatar-placeholder small">
                                {selectedConversation.otherUser.username.charAt(0).toUpperCase()}
                              </div>
                            )
                          )}
                        </div>
                        <div className="message-content">
                          <div className="message-header">
                            <span className="message-author">
                              {message.senderId === currentUser.id ? currentUser.username : selectedConversation.otherUser.username}
                            </span>
                            <span className="message-timestamp">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          {editingMessage === message.id ? (
                            <form onSubmit={handleEditSubmit} className="edit-message-form">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="edit-message-input"
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button type="submit" className="edit-save-btn">
                                  <Check size={14} />
                                </button>
                                <button type="button" onClick={cancelEditing} className="edit-cancel-btn">
                                  <X size={14} />
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="message-text-container">
                              <p className="message-text">{message.content}</p>
                              {message.senderId === currentUser.id && (
                                <div className="message-actions">
                                  <button onClick={() => startEditingMessage(message)} className="message-action-btn">
                                    <Edit size={14} />
                                  </button>
                                  <button onClick={() => deleteMessage(message.id)} className="message-action-btn delete">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              <form onSubmit={sendMessage} className="message-form">
                <div className="message-input-wrapper">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message @${selectedConversation.otherUser.username}`}
                    className="message-input"
                  />
                  <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="no-conversation-content">
              <AtSign className="no-conversation-icon" />
              <h3>Your Place to Talk</h3>
              <p>Select a friend to start chatting, or search for someone new.</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="error-toast">
          <span>Error: {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default DirectMessagesView;