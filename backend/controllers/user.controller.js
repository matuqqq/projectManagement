import usersService from '../services/users.service.js';

const registerUser = async (req, res, next) => {
    try{
        await usersService().register(req, res);
    } catch(error){
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try{
        await usersService().login(req, res);
    } catch(error){
        next(error);
    }    
}

export default{
    registerUser,
    loginUser
};