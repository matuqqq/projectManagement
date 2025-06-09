import mesaggesService from '../services/mesagges.service.js';

const getAllMessages = async (req, res, next) => {
    try {
        await channelsService().getAllChannels(req, res);
    } catch (error) {
        next(error);
    }
};

const createMessages = async (req, res, next) => {
    try {
        await channelsService().createChannel(req, res);
    } catch (error) {
        next(error);
    }
};


export default {
    getAllMessages,
    createMessages
};