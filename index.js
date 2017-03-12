'use strict';
/* eslint-env es6*/

var ConversationV1 = require('watson-developer-cloud/conversation/v1');

/**
 * Instantiate the Watson Conversation Service
 */
const conversation = new ConversationV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  version_date: ConversationV1.VERSION_DATE_2017_02_03
});

/**
 * Calls the conversation message api. 
 * returns a promise
 */
const message = function(text, context) {
  const payload = {
    workspace_id: process.env.WORKSPACE_ID,
    input: {
      text: text
    },
    context: context
  };
  return new Promise((resolve, reject) => conversation.message(payload, function(err, data) {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  }));
};

// This example makes two successive calls to conversation service.
// Note how the context is passed:
// In the first message the context is undefined. The service starts a new conversation.
// The context returned from the first call is passed in the second request - to continue the conversation.
message('first message', undefined)
  .then(response1 => {
    // APPLICATION-SPECIFIC CODE TO PROCESS THE DATA
    // FROM CONVERSATION SERVICE
    console.log(JSON.stringify(response1, null, 2), '\n--------');

    // invoke a second call to conversation
    return message('second message', response1.context);
  })
  .then(response2 => {
    console.log(JSON.stringify(response2, null, 2), '\n--------');
    console.log('Note that the two reponses should have the same context.conversation_id');
  })
  .catch(err => {
    // APPLICATION-SPECIFIC CODE TO PROCESS THE ERROR
    // FROM CONVERSATION SERVICE
    console.error(JSON.stringify(err, null, 2));
  });