"use strict";

let jwt = require("jsonwebtoken");

module.exports = {
    authenticate: function (req, res, next) {
        let token = req.headers['x-access-token'];
        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, GlobalConstant.tokenSecret, function (err, user) {
                if (err) {
                    return res.status(401).send({ success: false, message: 'Failed to authenticate token' });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.user = user;
                    next();
                }
            });

        } else {
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }
    }
}