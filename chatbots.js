'use strict';
const Botkit       = require('botkit');
const Conversation = require('./conversation');
const request      = require('superagent');
const slack_token  = process.env.SLACK_TOKEN;
const slack_oauth  = process.env.SLACK_OAUTH;

exports.fn = {

	/**
	 * Starts Slack-Bot
	 *
	 * @returns {*}
	 */
	slackBot() {

		// initialisation

		const slackController = Botkit.slackbot({
			// wait for a confirmation events for each outgoing message before continuing to the next message in a conversation
			require_delivery: true
		});
		const slackBot = slackController.spawn({
			token: slack_token
		});

		let bot_name = '';

		// create rtm connection

		slackBot.startRTM((err, bot, payload) => {
			if (err) {
				throw new Error('Could not connect to Slack');
			}
			bot_name = payload.self.name;
			// post a message to #general when bot is loaded
			slackController.log('Sending initial salutation...');
			bot.reply({channel: '#general'},
				`Howdy! \n I am glad to be part of the ${payload.team.name} team! \n My name is *${bot_name}* and I am here to help you.`)
		});

		// event listeners that handle incoming messages

		slackController.hears(['.*'], ['direct_message', 'direct_mention'], (bot, message) => {
			slackController.log('Slack message received');

			// process message with IBM Watson's Conversation

			Conversation.sendMessage(String(message.text), undefined)
				.then(response => {

					slackController.log('Response from Watson received');

					// classify incoming message and react accordingly

					if (response.intents[0].intent == 'search') {
						let question = encodeURI(response.input.text);
						let so_url = `https://api.duckduckgo.com/?q=!stack+${question}&format=json&pretty=1`;
						let go_url = `https://api.duckduckgo.com/?q=!google+${question}&format=json&pretty=1`;

						bot.reply(message, response.output.text.join('\n'));
						bot.reply(message, `<${so_url}|Answers from Stack Overflow> \n <${go_url}|Answers from Google>`);

					} else if (response.intents[0].intent == 'quote') {

						slackController.log('Requesting a quote...');

						request.get('http://quotes.rest/qod.json').then(function (res, err) {
							if (err) {
								bot.reply(message, err)
							}
							let watson_res = response.output.text.join('\n');
							let quote = res.body.contents.quotes[0].quote;
							let author = res.body.contents.quotes[0].author;
							bot.reply(message, `${watson_res} \n ${quote} -${author}`)
						}).catch(function () {
							slackController.log('error', 'There has been an error with the request.');
							bot.reply(message, 'Sorry, I cannot fetch any quote for you right now... :(')
						})

					} // intent = 'joke' is already being listened for in 'ambient' mode
					else {
						slackController.log('Response sent back');
						bot.reply(message, response.output.text.join('\n'));
					}
				})
				.catch(err => {
					console.error(JSON.stringify(err, null, 2));
				});
		});

		// listens for keyword 'joke', no mention is needed
		slackController.hears(['joke'], ['ambient'], (bot, message) => {
			slackController.log('Slack message received');

			let userId = message.user,
				userProfile = {};

			bot.api.users.info({token: slack_token, user: userId}, function (err, res) {
				if (err) slackController.log('error', err);
				userProfile = res.user.profile;

				// get a joke from the icndb and replace 'Chuck Norris' with user's name
				request.get(`http://api.icndb.com/jokes/random?firstName=${userProfile.first_name || 'Chuck'}&lastName=${userProfile.last_name || 'Norris'}&escape=javascript`)
					.then(function (res, err) {
						if (err) slackController.log('error', err);
						let text = JSON.parse(res.text);
						let joke = text.value.joke;

						bot.reply(message, joke)
					}).catch(function () {
					slackController.log('error', 'There has been an error with the request.');
					bot.reply(message, 'Sorry, I am out of jokes :(')
				})

			});


		});
	}
};
