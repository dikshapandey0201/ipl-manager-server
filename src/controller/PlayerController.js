const Player = require('../model/PlayerModel');


// Create a new player
exports.createPlayer = async (req, res) => {
    try {
        const newPlayer = new Player(req.body);
        await newPlayer.save();
        res.status(201).json({ message: 'Player created successfully', player: newPlayer });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all players
exports.getAllPlayers = async (req, res) => {
    try {
        const players = await Player.find();
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a player by ID
exports.getPlayerById = async (req, res) => {
    const playerId = req.params.id;
    try {
        const player = await Player.findById(playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a player by ID
exports.updatePlayer = async (req, res) => {
    const playerId = req.params.id;
    const { name, age, skill, dob, debut, image, matches_played, runs,wickets,nationality } = req.body;
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(playerId, { name, age, skill, dob, debut, image, matches_played, runs,wickets,nationality  }, { new: true });
        if (!updatedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json({ message: 'Player updated successfully', player: updatedPlayer });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a player by ID
exports.deletePlayer = async (req, res) => {
    const playerId = req.params.id;
    try {
        const deletedPlayer = await Player.findByIdAndDelete(playerId);
        if (!deletedPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json({ message: 'Player deleted successfully', player: deletedPlayer });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get players by name
exports.getPlayersByName = async (req, res) => {
    const playerName = req.params.name;
    const decodedName = decodeURIComponent(playerName);

    if(!decodedName) {
        return res.status(400).json({ message: 'Player name is required' });
    }
    try {
        const players = await Player.find({ name: { $regex: decodedName, $options: 'i' } });
        if (players.length === 0) {
            return res.status(404).json({ message: 'No players found with that name' });
        }
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// add players in bulk from json file
exports.bulkAddPlayers = async (req, res) => {

    try {
        const playersData = req.body;
        const players = await Player.insertMany(playersData);
        res.status(201).json({ message: 'Players added successfully', players });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}
