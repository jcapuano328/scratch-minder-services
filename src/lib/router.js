var config = require('config');
    oauth2 = require('../services/oauth2');

module.exports = require('scratch-minder-nub')(config).Router(oauth2.authorise);
