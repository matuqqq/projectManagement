import directMessagesService from '../services/directMessages.service.js';

const getMessages = async (req, res) => {
    const { userId1, userId2 } = req.params;
    try {
        const messages = await directMessagesService().getMessagesBetweenUsers(userId1, userId2);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
};

const createMessage = async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    if (!receiverId) {
        return res.status(400).json({ error: "No hay receptor del mensaje." });
    }
    if (!senderId) {
        return res.status(400).json({ error: "No hay emisor del mensaje." });
    }
    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "El contenido del mensaje no puede estar vacío." });
    }
    try {
        const message = await directMessagesService().createDirectMessage(senderId, receiverId, content);
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Error sending message' });
    }
};

const updateMessage = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "El contenido del mensaje no puede estar vacío." });
    }
    try {
        const updated = await directMessagesService().updateDirectMessage(id, content);
        res.json(updated);
    } catch (err) {
        res.status(404).json({ error: 'Mensaje no encontrado o error actualizando.' });
    }
};

const deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        await directMessagesService().deleteDirectMessage(id);
        res.json({ message: "Mensaje eliminado correctamente." });
    } catch (err) {
        res.status(404).json({ error: 'Mensaje no encontrado o error eliminando.' });
    }
};

export default {
    getMessages,
    createMessage,
    updateMessage,
    deleteMessage
};