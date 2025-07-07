import serversService from '../services/servers.service.js';

const getAllServers = async (req, res, next) => {
    try {
        await serversService().getAllServers(req, res);
    } catch (error) {
        next(error);
    }
};

const getServerById = async (req, res, next) => {
    try {
        await serversService().getServerById(req, res);
    } catch (error) {
        next(error);
    }
};

const createServer = async (req, res, next) => {
    try {
        await serversService().createServer(req, res);
    } catch (error) {
        next(error);
    }
};

const updateServer = async (req, res, next) => {
    try {
        await serversService().updateServer(req, res);
    } catch (error) {
        next(error);
    }
};

const deleteServer = async (req, res, next) => {
    try {
        await serversService().deleteServer(req, res);
    } catch (error) {
        next(error);
    }
};

export default {
    getAllServers,
    getServerById,
    createServer,
    updateServer,
    deleteServer
};
