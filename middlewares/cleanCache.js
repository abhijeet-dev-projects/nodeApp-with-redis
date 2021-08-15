const { clearHash } = require('../services/cache');

module.exports =  async (req, res, next) => {
    await next(); // it will let process the next function in the chain

    clearHash(req.user.id);
}