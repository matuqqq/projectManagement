import usersService from '../services/users.service.js';
const registerUser = async (req, res, next) => {
    console.log(req.body);
    try{
    await usersService().register(req, res);
    } catch(error){
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    console.log(req.body);
    try{
        await usersService().login(req, res);
    } catch(error){
        next(error);
    }    
};

const deleteUser = async (req, res, next) => {
    try {
        await usersService().deleteUser(req, res);
    } catch (error) {
        next(error);
    }
};

const getUserProfile = async (req, res, next) => {
    console.log('→ GET /api/user/:id  Handler getUserProfile ejecutado para id=', req.params.id);
    try {
        await usersService().getUserProfile(req, res);
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        await usersService().updateUser(req, res);
    } catch (error) {
        next(error);
    }
};

export default {
    registerUser,
    loginUser,
    deleteUser,
    getUserProfile,
    updateUser
};