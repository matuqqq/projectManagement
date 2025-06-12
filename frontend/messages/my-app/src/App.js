// App.js
import React, { useState, useEffect, useRef } from 'react';

// Assuming your backend is running on localhost:3000
const API_BASE_URL = 'http://localhost:3000/api';

function App() {
    const [messages, setMessages] = useState([]);
    const [newMessageContent, setNewMessageContent] = useState('');
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingMessageContent, setEditingMessageContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [channelId, setChannelId] = useState('some-channel-id'); // Simulating a default channel ID
    const [userId, setUserId] = useState('user123'); // Simulating a default user ID 
    const messagesEndRef = useRef(null); // Ref for scrolling to the bottom of messages

    // State for modal visibility and message to delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);

    // Scroll to the bottom of the messages list whenever messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Function to fetch messages
    const fetchMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch messages for the current channelId
            const response = await fetch(`${API_BASE_URL}/messages?channelId=${channelId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMessages(data.data); // Assuming messages are in data.data as per service response
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages on component mount or when channelId/userId changes
    useEffect(() => {
        fetchMessages();
    }, [channelId, userId]); // Re-fetch if channelId or userId changes

    // Handle sending a new message
    const handleSendMessage = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!newMessageContent.trim()) return; // Don't send empty messages

        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/messages/${userId}`, { // userId from params
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    channelId: channelId,
                    message: newMessageContent.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            setNewMessageContent(''); // Clear the input field
            fetchMessages(); // Re-fetch messages to show the new one
        } catch (err) {
            console.error('Error sending message:', err);
            setError(`Failed to send message: ${err.message}.`);
        }
    };

    // Handle starting the editing process
    const handleEditClick = (message) => {
        setEditingMessageId(message.id);
        setEditingMessageContent(message.content);
    };

    // Handle saving the edited message
    const handleSaveEdit = async (messageId) => {
        if (!editingMessageContent.trim()) return;

        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/messages/${messageId}/${userId}`, { // userId from params
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: editingMessageContent.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            setEditingMessageId(null); // Exit editing mode
            setEditingMessageContent('');
            fetchMessages(); // Re-fetch messages to show the updated one
        } catch (err) {
            console.error('Error updating message:', err);
            setError(`Failed to update message: ${err.message}.`);
        }
    };

    // Handle canceling the edit
    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditingMessageContent('');
    };

    // Handle opening the delete confirmation modal
    const handleDeleteClick = (message) => {
        setMessageToDelete(message);
        setShowDeleteModal(true);
    };

    // Handle confirming the delete action
    const handleConfirmDelete = async () => {
        if (!messageToDelete) return;

        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/messages/${messageToDelete.id}/${userId}`, { // userId from params
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            setShowDeleteModal(false);
            setMessageToDelete(null);
            fetchMessages(); // Re-fetch messages after deletion
        } catch (err) {
            console.error('Error deleting message:', err);
            setError(`Failed to delete message: ${err.message}.`);
        }
    };

    // Handle canceling the delete action
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setMessageToDelete(null);
    };


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-inter">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold rounded-md">Channel Messages</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">User ID: <span className="font-bold">{userId}</span></span>
                        <span className="text-sm font-medium">Channel ID: <span className="font-bold">{channelId}</span></span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-4">
                {/* Messages Display Area */}
                <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col overflow-hidden">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Messages</h2>
                    {loading && (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-600">Loading messages...</span>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}
                    {!loading && messages.length === 0 && !error && (
                        <p className="text-center text-gray-500 py-10">No messages yet. Be the first to send one!</p>
                    )}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`mb-4 p-4 rounded-lg shadow-md ${
                                    msg.userId === userId ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-100 self-start mr-auto'
                                } max-w-[80%]`}
                            >
                                {editingMessageId === msg.id ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            value={editingMessageContent}
                                            onChange={(e) => setEditingMessageContent(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleSaveEdit(msg.id)}
                                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 shadow-sm"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300 shadow-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-800 break-words">{msg.content}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {msg.author ? msg.author.name : 'Unknown User'} - {new Date(msg.createdAt).toLocaleString()}
                                        </p>
                                        {msg.userId === userId && ( // Only show edit/delete if current user is the author
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    onClick={() => handleEditClick(msg)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-300"
                                                    title="Edit message"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(msg)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium transition duration-300"
                                                    title="Delete message"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
                    </div>

                    {/* Message Input Form */}
                    <form onSubmit={handleSendMessage} className="mt-6 p-4 bg-gray-50 rounded-lg shadow-inner">
                        <div className="flex items-center gap-4">
                            <textarea
                                value={newMessageContent}
                                onChange={(e) => setNewMessageContent(e.target.value)}
                                placeholder="Type your message here..."
                                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-800"
                                rows="3"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this message?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCancelDelete}
                                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
