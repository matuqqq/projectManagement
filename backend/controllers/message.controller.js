// messages.controller.js
import messagesService from '../services/message.service.js'; // Corrected import path and filename

/**
 * Controller function to handle getting all messages.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
const getAllMessages = async (req, res, next) => {
    try {
        await messagesService().getAllMessages(req, res); // Call the service method
    } catch (error) {
        next(error); // Pass error to the next middleware (error handler)
    }
};

/**
 * Controller function to handle creating a new message.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
const createMessage = async (req, res, next) => { // Corrected function name to singular 'createMessage'
    try {
        await messagesService().createMessage(req, res); // Call the service method
    } catch (error) {
        next(error); // Pass error to the next middleware (error handler)
    }
};

/**
 * Controller function to handle updating an existing message.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
const updateMessage = async (req, res, next) => {
    try {
        await messagesService().updateMessage(req, res); // Call the service method
    } catch (error) {
        next(error); // Pass error to the next middleware (error handler)
    }
};

/**
 * Controller function to handle deleting an existing message.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
const deleteMessage = async (req, res, next) => {
    try {
        await messagesService().deleteMessage(req, res); // Call the service method
    } catch (error) {
        next(error); // Pass error to the next middleware (error handler)
    }
};

export default {
    getAllMessages,
    createMessage, // Export the singular function name
    updateMessage,
    deleteMessage
};
