import helloService from '../services/helloword.service.js';

export default (req, res, next) => {
    return res.status(200).json({
        message: helloService().getHelloMessage(),
    });
}