import channelsService from '../services/channels.service.js';

const getAllChannels = async (req, res, next) => {
    try {
        await channelsService().getAllChannels(req, res);
    } catch (error) {
        next(error);
    }
};

const getChannelById = async (req, res, next) => {
    try {
        await channelsService().getChannelById(req, res);
    } catch (error) {
        next(error);
    }
};

const createChannel = async (req, res, next) => {
    try {
        await channelsService().createChannel(req, res);
    } catch (error) {
        next(error);
    }
};


export default {
    getAllChannels,
    getChannelById,
    createChannel
};