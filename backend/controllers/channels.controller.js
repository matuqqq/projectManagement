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


const updateChannel = async (req, res, next) => {
    try{
        await channelsService().updateChanel(req, res);
    }catch(erorr){
        next(error);
    }
}

const deleteChannel = async (req, res, next) => {
    try{
        await channelsService().deleteChannel(req, res);
    }catch(erorr){
        next(error);
    }
}

export default {
    getAllChannels,
    getChannelById,
    createChannel,
    updateChannel,
    deleteChannel
};