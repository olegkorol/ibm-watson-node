'use strict';
const Botkit = require('botkit');
const Conversation = require('./conversation');

exports.fn = {

	/**
	 * Starts Slack-Bot
	 * 
	 * @returns {promise}
	 */
	slackBot() {
		// initialise slack bot
		const slackController = Botkit.slackbot();
		const slackBot = slackController.spawn({
			token: process.env.SLACK_TOKEN
		});

		slackController.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
			slackController.log('Slack message received');
			console.log('MESSAGE:', message.text);

			Conversation.sendMessage(String(message.text), undefined)
				.then(response => {
					console.log('RESPONSE:', response.output.text.join('\n'));
					bot.reply(message, response.output.text.join('\n'));

					// return Conversation.sendMessage('message 2', response.context);
					// todo: the context has to be saved and passed to next messages

				})
				//.then(response2 => {})
				.catch(err => {
					console.error(JSON.stringify(err, null, 2));
				});
		});

		slackBot.startRTM();
	}
}