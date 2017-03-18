'use strict';

//const Conversation = require('./conversation');

module.exports = function (router) {

    router.get('/', function (req, res) {

        res.status(200).send(`<h2>This is a Chat Bot that operates in Slack :)</h2>`);
    })

};