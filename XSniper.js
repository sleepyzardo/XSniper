const { Client } = require('discord.js-selfbot-v13');
const extractPokemonData = require('./_base/buy.js');
const sendWebhook = require('./_base/logging.js')
const {logInfo, logError} = require('./_base/console.js')
const config = require('./config.json');
const random  = require('lodash');

const client = new Client({checkUpdate: false});
let channel = '';
let buyLock = false;
let messageContent = '<@716390085896962058> m s --sh --lim 3'
const channelId = config.discord.channelId;
const webhook = config.discord.webhook;
const token = config.discord.token;
const priceLimit = config.bot.priceLimit;
const snipeMode = config.bot.snipeMode; 


client.on('ready', async () => {
    logInfo(`Connected to ${client.user.tag}`);
    channel = await client.channels.fetch(channelId);
    if (!channel) {
        logError(`Channel with ID ${channelId} not found.`);
        return;
    }
    spamMessages(channel);
});

client.on('messageCreate', async (message) => {
    if (
        message.author.id === '716390085896962058' &&
        message.embeds.length > 0 &&
        message.embeds[0].title.includes('Pokétwo Marketplace') &&
        !buyLock 
    ) {
        const embed = message.embeds[0];
        const raw_data = embed.description.split('\n');
        for (const line of raw_data) {
            const pokemonData = extractPokemonData(line);
            if (pokemonData && parseInt(pokemonData.price) < priceLimit) {
                buyLock = true; 
                await channel.send(`<@716390085896962058> m buy ${pokemonData.id}`);
                break; 
            }
        }
            
        
    }
    if ( message.channel.id == channelId ) {
        if (message.content.toLowerCase().includes('sure')) {             // Confirmation Event
            await message.clickButton();
        } else if (message.content.toLowerCase().includes('purchased')) {               // Purchased Event
            sendWebhook(webhook, 'purchased', message);
            buyLock = false;

        } else if (message.content.toLowerCase().includes('exists')) {          // Missed Event
            sendWebhook(webhook, 'missed', message);
            buyLock = false;
        } else if (message.content.toLowerCase().includes('enough')) {
            buyLock = false
            logError('Not Enough Pokécoins')
        }
    }
});

async function spamMessages(channel) {
    setInterval(() => {
        if (!buyLock) {
            channel.send(messageContent)
                .then(() => logInfo('Message sent successfully'))
                .catch(error => logError('Error sending message:', error));
        } else {
            logInfo('Skipping message sending due to active buy process');
        }
    }, random(3, 6) * 1000); 
}

client.login(token)