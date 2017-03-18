'use strict';

const ConversationV1 = require('watson-developer-cloud/conversation/v1');

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
exports.sendMessage = (text, context) => {
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

