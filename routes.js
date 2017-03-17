'use strict';

const Conversation = require('./conversation');

module.exports = function (router) {

    router.get('/test', function (req, res) {

        // This example makes two successive calls to conversation service.
        // Note how the context is passed:
        // In the first message the context is undefined. The service starts a new conversation.
        // The context returned from the first call is passed in the second request - to continue the conversation.
        Conversation.sendMessage('Hi!', undefined)
            .then(response1 => {
                // APPLICATION-SPECIFIC CODE TO PROCESS THE DATA
                // FROM CONVERSATION SERVICE
                console.log(JSON.stringify(response1, null, 2), '\n--------');

                // invoke a second call to conversation
                return Conversation.sendMessage('Tell me a joke', response1.context);
            })
            .then(response2 => {
                console.log(JSON.stringify(response2, null, 2), '\n--------');
                //console.log('Note that the two reponses should have the same context.conversation_id');
                res.status(200).json(response2);
            })
            .catch(err => {
                // APPLICATION-SPECIFIC CODE TO PROCESS THE ERROR
                // FROM CONVERSATION SERVICE
                console.error(JSON.stringify(err, null, 2));
            });
    })

}