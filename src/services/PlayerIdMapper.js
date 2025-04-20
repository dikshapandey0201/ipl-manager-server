const Player = require('../model/PlayerModel');

async function PlayerIdMapper(playerNames) {
    const result = {
        error: false,
        message: null,
        missingPlayers: [],
        validPlayers: {}
    };

    if (!Array.isArray(playerNames)) {
        result.error = true;
        result.message = 'Input must be an array of player names';
        return result;
    }

    if (playerNames.length === 0) {
        result.error = true;
        result.message = 'Players list cannot be empty';
        return result;
    }

    const lowerCaseInputMap = playerNames.reduce((acc, name) => {
        acc[name.toLowerCase()] = name;
        return acc;
    }, {});

    const playerDocs = await Player.find({
        name: { $in: playerNames.map(name => new RegExp(`^${name}$`, 'i')) }
    }, { _id: 1, name: 1 });

    const playersIdMap = {};
    playerDocs.forEach(player => {
        const originalName = lowerCaseInputMap[player.name.toLowerCase()];
        playersIdMap[originalName] = player._id;
    });

    const missingPlayers = playerNames.filter(name => !playersIdMap[name]);

    if (missingPlayers.length > 0) {
        result.error = true;
        result.message = 'Some players were not found';
        result.missingPlayers = missingPlayers;
    } else {
        result.message = 'All players found successfully';
        result.validPlayers = playersIdMap;
    }


    return result;
}

module.exports = PlayerIdMapper;
