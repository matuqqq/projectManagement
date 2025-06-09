import searchService from '../services/search.service.js';

const searchMessages = async (req, res, next) => {
    try {
        await searchService().searchMessages(req, res);
    } catch (error) {
        next(error);
    }
};

const searchInChannel = async (req, res, next) => {
    try {
        await searchService().searchInChannel(req, res);
    } catch (error) {
        next(error);
    }
};

const searchInServer = async (req, res, next) => {
    try {
        await searchService().searchInServer(req, res);
    } catch (error) {
        next(error);
    }
};

const searchDirectMessages = async (req, res, next) => {
    try {
        await searchService().searchDirectMessages(req, res);
    } catch (error) {
        next(error);
    }
};

const getSearchSuggestions = async (req, res, next) => {
    try {
        await searchService().getSearchSuggestions(req, res);
    } catch (error) {
        next(error);
    }
};

export default {
    searchMessages,
    searchInChannel,
    searchInServer,
    searchDirectMessages,
    getSearchSuggestions
};