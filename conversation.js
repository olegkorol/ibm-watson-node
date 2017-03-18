'use strict';
const ConversationV1 = require('watson-developer-cloud/conversation/v1');

// new instance of Conversation
const conversation = new ConversationV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  version_date: ConversationV1.VERSION_DATE_2017_02_03
});

/**
 * Call to Conversation API: send message
 * 
 * @param {string} text 
 * @param {object} context 
 * @returns {promise}
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

