'use strict';
const Botkit = require('botkit');
const Conversation = require('./conversation');
const request = require('superagent');

exports.fn = {

	/**
	 * Starts Slack-Bot
	 * 
	 * @returns {promise}
	 */
	slackBot() {
		// initialise slack bot
		const slackController = Botkit.slackbot({
			// will force Botkit to wait for a confirmation events for each outgoing message before continuing to the next message in a conversation
			require_delivery: true
		});
		const slackBot = slackController.spawn({
			token: process.env.SLACK_TOKEN
		});

		// establish rtm websocket connection
		slackBot.startRTM((err, bot, payload) => {
			if (err) {
				throw new Error('Could not connect to Slack');
			}
			// post a message to #general when bot is loaded
			bot.reply({channel: '#general'},
				`Howdy! \n I am glad to be part of the ${payload.team.name} team! \n My name is *${payload.self.name}* and I am here to help you.`)
		});

		// event listeners:
		// listens for keyword 'chatbot'
		slackController.hears(['chatbot'], ['ambient', 'direct_message', 'direct_mention'], (bot, message) => {
			slackController.log('Slack message received');
			console.log('MESSAGE:', message);

			Conversation.sendMessage(String(message.text), undefined)
				.then(response => {
					
					if (response.intents[0].intent == 'search') {
						let question = encodeURI(response.input.text.replace('chatbot', ''));
						let url = `https://api.duckduckgo.com/?q=!stack+${question}&format=json&pretty=1`;

						bot.reply(message, response.output.text.join('\n'))
						bot.reply(message, url)

					} else if (response.intents[0].intent == 'quote') {
						
						request.get('http://quotes.rest/qod.json').then(function (res, err) {
							if (err) {
								bot.reply(message, err)
							}
							let watson_res = response.output.text.join('\n');
							let quote = res.body.contents.quotes[0].quote;
							let author = res.body.contents.quotes[0].author;
							bot.reply(message, `${watson_res} \n ${quote} -${author}`)
						}).catch(function(err) {
							console.error('There has been an error with the GET request.')
							bot.reply(message, 'Sorry, I cannot fetch any quote for you right now... :(')
						})

					} else {
						console.log('RESPONSE:', response.output.text.join('\n'));
						bot.reply(message, response.output.text.join('\n') + url);
					}
					// todo: pass response.context to next Conversation request for dialog flow
					// e.g.: Conversation.sendMessage('message 2', response.context);
				})
				.catch(err => {
					console.error(JSON.stringify(err, null, 2));
				});
		});
	}
}