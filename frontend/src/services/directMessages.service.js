import { sendGet, sendPost, sendPut, sendDelete } from '../connections/backendConnect';

class DirectMessagesService {
  // Obtener mensajes entre dos usuarios
  async getMessagesBetweenUsers(userId1, userId2, token) {
    try {
      const response = await sendGet(`/direct-messages/${userId1}/${userId2}`, {}, token);
      
      // Verificar si la respuesta es exitosa
      if (response && !response.error) {
        return response;
      } else {
        throw new Error(response?.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Enviar un nuevo mensaje directo
  async sendDirectMessage(messageData, token) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateMessageContent(messageData.content);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await sendPost('/direct-messages', {
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: validation.content
      }, token);

      if (response && !response.error) {
        return response;
      } else {
        throw new Error(response?.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Actualizar un mensaje existente
  async updateMessage(messageId, content, token) {
    try {
      // Validar contenido
      const validation = this.validateMessageContent(content);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await sendPut(`/direct-messages/${messageId}`, { 
        content: validation.content 
      }, token);

      if (response && !response.error) {
        return response;
      } else {
        throw new Error(response?.error || 'Failed to update message');
      }
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  // Eliminar un mensaje
  async deleteMessage(messageId, token) {
    try {
      const response = await sendDelete(`/direct-messages/${messageId}`, token);
      
      if (response && !response.error) {
        return response;
      } else {
        throw new Error(response?.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Obtener conversaciones del usuario
  async getUserConversations(userId, token) {
    try {
      const response = await sendGet(`/direct-messages/conversations/${userId}`, {}, token);
      
      if (response && !response.error) {
        // Procesar las conversaciones para agregar información adicional
        return this.processConversationsForUI(response, userId);
      } else {
        throw new Error(response?.error || 'Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Marcar mensajes como leídos
  async markMessagesAsRead(userId1, userId2, token) {
    try {
      const response = await sendPut('/direct-messages/mark-read', { 
        userId1, 
        userId2 
      }, token);
      
      return response;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // No lanzar error aquí ya que es una funcionalidad opcional
      return null;
    }
  }

  // Buscar usuarios para iniciar conversaciones
  async searchUsers(query, token) {
    try {
      const response = await sendGet('/users/search', { query }, token);
      
      if (response && !response.error) {
        return response;
      } else {
        throw new Error(response?.error || 'Failed to search users');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Obtener información de un usuario
  async getUserInfo(userId, token) {
    try {
      const response = await sendGet(`/user/${userId}`, {}, token);
      
      if (response && !response.error) {
        return response;
      } else {
        throw new Error(response?.error || 'Failed to fetch user info');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  // Procesar conversaciones para la UI
  processConversationsForUI(conversations, currentUserId) {
    return conversations.map(conversation => ({
      ...conversation,
      // Agregar información adicional si es necesario
      formattedLastMessageTime: conversation.lastMessageTime ? 
        this.formatMessageTime(conversation.lastMessageTime) : '',
      // Calcular mensajes no leídos (esto requeriría lógica adicional en el backend)
      unreadCount: conversation.unreadCount || 0
    }));
  }

  // Formatear fecha para mostrar en la UI
  formatMessageTime(date) {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
      return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  // Validar contenido del mensaje
  validateMessageContent(content) {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Message content is required' };
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (trimmedContent.length > 2000) {
      return { valid: false, error: 'Message is too long (max 2000 characters)' };
    }

    return { valid: true, content: trimmedContent };
  }

  // Generar ID temporal para mensajes optimistas
  generateTempId() {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Procesar mensajes para la UI (agregar información adicional)
  processMessagesForUI(messages, currentUserId) {
    return messages.map(message => ({
      ...message,
      isOwn: message.senderId === currentUserId,
      formattedTime: this.formatMessageTime(message.createdAt),
      canEdit: message.senderId === currentUserId,
      canDelete: message.senderId === currentUserId
    }));
  }

  // Agrupar mensajes por fecha
  groupMessagesByDate(messages) {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
      formattedDate: this.formatDateHeader(new Date(date))
    }));
  }

  // Formatear encabezado de fecha
  formatDateHeader(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }

  // Manejar errores de red
  handleNetworkError(error) {
    if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
      return 'Network connection failed. Please check your internet connection.';
    }
    
    if (error.message === 'Request timeout') {
      return 'Request timed out. Please try again.';
    }
    
    return error.message || 'An unexpected error occurred';
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Obtener token de autenticación
  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  // Obtener usuario actual
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}

export default new DirectMessagesService();