'use strict';

const Botkit = require('botkit');
const Conversation = require('./conversation');

// configure bot
const slackController = Botkit.slackbot();
const slackBot = slackController.spawn({
	token: process.env.SLACK_TOKEN
});

slackController.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
	slackController.log('Slack message received');

	console.log('MESSAGE:', message.text);

	Conversation.sendMessage(String(message.text), undefined)
		.then(response => {
			// APPLICATION-SPECIFIC CODE TO PROCESS THE DATA
			// FROM CONVERSATION SERVICE

			console.log('RESPONSE:', response.output.text.join('\n'));
			bot.reply(message, response.output.text.join('\n'));

			// return Conversation.sendMessage('message 2', response.context);
			// todo: the context has to be saved and passed to next messages

		})
		//.then(response2 => {})
		.catch(err => {
			// APPLICATION-SPECIFIC CODE TO PROCESS THE ERROR
			// FROM CONVERSATION SERVICE
			console.error(JSON.stringify(err, null, 2));
		});
});

slackBot.startRTM();

