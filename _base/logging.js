const axios = require('axios');
const {logInfo, logError} = require('./console')


function extractDetails(message) {
    const pattern = /Level (\d+)\s+([\w.]+(?:\s[\w.]+)*)<:.*?>\s+\((\d+\.\d+)%\).*?Listing #(\d+).*?for ([\d,]+) Pokécoins/;

    const match = message.match(pattern);

    if (match) {
        return {
            pokemon_level: parseInt(match[1], 10), 
            pokemon_name: match[2],              
            pokemon_iv: match[3],  
            market_id: match[4],
            price: match[5],           
        };
    }

    return null;
}

async function getPokemonSprite(pokemonName) {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        const spriteUrl = response.data.sprites.front_default; 
        return spriteUrl;
    } catch (error) {
        logError(`Error fetching sprite for ${pokemonName}: ${error.message}`);
        return null;
    }
}


async function sendWebhook(webhookUrl, method, message) {
    let webhookData = {
        username: 'Pokétwo Market Sniper',
    };

    if (method === 'purchased') {
        const data = extractDetails(message.content);
        const spriteUrl = await getPokemonSprite(data.pokemon_name); 

        webhookData.embeds = [
            {
                title: `A ✨ Level ${data.pokemon_level} ${data.pokemon_name}`,
                color: 0xffd700,
                thumbnail: {
                    url: spriteUrl || '', 
                },
                description: `**Snipe Information:**\n**Name:** ${data.pokemon_name}\n**Level:** ${data.pokemon_level}\n**IV:** ${data.pokemon_iv}\n**Price:** ${data.price}\n\n**[Jump To Message](${message.url})**`,
                timestamp: new Date(),
            },
        ];
    } else if (method == 'missed') {
        webhookData.embeds = [
            {
                title: `A ✨ was missed!`,
                color: 0xffd700,
                description: `**[Jump To Message](${message.url})**`,
                timestamp: new Date(),
            },
        ];
    }

    try {
        await axios.post(webhookUrl, webhookData);
        logInfo('Webhook sent successfully.');
    } catch (error) {
        logError(`Error sending webhook message: ${error.message}`);
        if (error.response) {
            logError(`Response Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

module.exports = sendWebhook;
