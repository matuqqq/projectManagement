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
import './DirectMessagesView.css';

const DirectMessagesView = () => {
  const API_URL = process.env.REACT_APP_URLAPI;
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

  // Mock user data - en una app real vendría del contexto de autenticación
  const currentUser = {
    id: "user1",
    username: "CurrentUser",
    avatar: null
  };

  // Mock conversations data - esto vendría de una API real
  const mockConversations = [
    {
      id: "conv1",
      otherUser: {
        id: "user2",
        username: "Alice",
        avatar: null,
        status: "online"
      },
      lastMessage: "Hey, how are you?",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unreadCount: 2
    },
    {
      id: "conv2",
      otherUser: {
        id: "user3",
        username: "Bob",
        avatar: null,
        status: "away"
      },
      lastMessage: "Thanks for the help!",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      unreadCount: 0
    },
    {
      id: "conv3",
      otherUser: {
        id: "user4",
        username: "Charlie",
        avatar: null,
        status: "offline"
      },
      lastMessage: "See you tomorrow",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 1
    }
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(currentUser.id, selectedConversation.otherUser.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      // En una app real, esto sería una llamada a la API
      // const response = await fetch(`${API_URL}/direct-messages/conversations`);
      // const data = await response.json();
      
      // Por ahora usamos datos mock
      setTimeout(() => {
        setConversations(mockConversations);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
      setIsLoading(false);
    }
  };

  const loadMessages = async (userId1, userId2) => {
    try {
      setIsLoadingMessages(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/direct-messages/${userId1}/${userId2}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data);
      
      // Mark conversation as read
      markConversationAsRead(selectedConversation.id);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
      // Use mock data for demo
      const mockMessages = [
        {
          id: "msg1",
          content: "Hey, how are you doing?",
          senderId: selectedConversation.otherUser.id,
          receiverId: currentUser.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 10),
          read: true
        },
        {
          id: "msg2",
          content: "I'm doing great! Thanks for asking. How about you?",
          senderId: currentUser.id,
          receiverId: selectedConversation.otherUser.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 8),
          read: true
        },
        {
          id: "msg3",
          content: "That's awesome! I'm doing well too. Working on some new projects.",
          senderId: selectedConversation.otherUser.id,
          receiverId: currentUser.id,
          createdAt: new Date(Date.now() - 1000 * 60 * 5),
          read: false
        }
      ];
      setMessages(mockMessages);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('accessToken');
      const messageData = {
        senderId: currentUser.id,
        receiverId: selectedConversation.otherUser.id,
        content: newMessage.trim()
      };

      const response = await fetch(`${API_URL}/direct-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      
      // Add message to local state
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Update conversation's last message
      updateConversationLastMessage(selectedConversation.id, sentMessage);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // For demo purposes, add message locally even if API fails
      const mockMessage = {
        id: `msg_${Date.now()}`,
        content: newMessage.trim(),
        senderId: currentUser.id,
        receiverId: selectedConversation.otherUser.id,
        createdAt: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, mockMessage]);
      setNewMessage('');
      updateConversationLastMessage(selectedConversation.id, mockMessage);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/direct-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      });

      if (!response.ok) {
        throw new Error('Failed to edit message');
      }

      const updatedMessage = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent } : msg
      ));
      
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing message:', error);
      // For demo, update locally
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent } : msg
      ));
      setEditingMessage(null);
      setEditContent('');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/direct-messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      // For demo, delete locally
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
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
          ) : (
            <div className="conversations-list">
              {filteredConversations.map((conversation) => (
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
                      style={{ backgroundColor: getStatusColor(conversation.otherUser.status) }}
                    />
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="username">{conversation.otherUser.username}</span>
                      <span className="last-message-time">{formatTime(conversation.lastMessageTime)}</span>
                    </div>
                    <div className="last-message">
                      {conversation.lastMessage}
                    </div>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="unread-badge">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              ))}
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
                  style={{ backgroundColor: getStatusColor(selectedConversation.otherUser.status) }}
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

                  {messages.map((message) => (
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
                  ))}
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