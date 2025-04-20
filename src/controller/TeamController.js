const Team = require('../model/TeamModel');
const Player = require('../model/PlayerModel');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const PlayerIdMapper  = require('../services/PlayerIdMapper');


// 1. Create a team
exports.createTeam = async (req, res) => {
    try {
        const { team_code, team_name, owners, head_coach, support_staff, captain, players, championships, team_theme_color, team_logo, team_name_bg,venue } = req.body;

        // players id mapping
        const playersExists = await PlayerIdMapper(players);
        if (playersExists.error) {
            return res.status(400).json({
                message: playersExists.message, 
                missingPlayers: playersExists.missingPlayers 
            });
        }

        const newTeam = new Team({
            team_code,
            team_name,
            owners,
            head_coach,
            support_staff,
            captain,
            players: Object.values(playersExists.validPlayers),
            championships,
            team_theme_color,
            team_logo,
            team_name_bg,
            venue
        });

        await newTeam.save();
        res.status(201).json({ message: 'Team created successfully' });

    } catch (error) {
        console.error('Error creating team:', error.message); 
        res.status(400).json({ 
            message: 'Error creating team', 
            error: error.message || 'Unknown error' 
        });
    }
};

// 2. Create teams in bulk from a json file
exports.bulkUploadTeams = async (req, res) => {
    try {
        const teamsData = req.body;

        if (!Array.isArray(teamsData)) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of teams.' });
        }

        for (const teamData of teamsData) {
            const { team_code, team_name, owners, head_coach, support_staff, captain, players, championships, team_theme_color, team_logo, team_name_bg,venue } = teamData;
            // players id mapping
            const playersExists = await PlayerIdMapper(players);
            if (playersExists.error) {
                return res.status(400).json({
                    message: playersExists.message,
                    missingPlayers: playersExists.missingPlayers
                });
            }

            const newTeam = new Team({
                team_code,
                team_name,
                owners,
                head_coach,
                support_staff,
                captain,
                players: Object.values(playersExists.validPlayers),
                championships,
                team_theme_color,
                team_logo,
                team_name_bg,
                venue
            });

            await newTeam.save();
        }

        res.status(201).json({ message: 'Teams created successfully' });

    } catch (error) {

        res.status(400).json({ 
            message: 'Error creating teams', 
            error: error.message || 'Unknown error' 
        });
    }
};

// 3. Get all teams
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find({}).populate('players').exec();
        res.status(200).json(teams);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error fetching teams', 
            error: error.message || 'Unknown error' 
        });
    }
}

// 4. Get a team by ID
exports.getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const team = await Team.findById(id).populate('players').exec();
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(team);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error fetching team', 
            error: error.message || 'Unknown error' 
        });
    }
};

// 5. Get team by name
exports.getTeamByName = async (req, res) => {
    try {
        const { teamname } = req.params;
        const decodedName = decodeURIComponent(teamname);
 
        if (!decodedName) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const team = await Team.findOne({ team_name: new RegExp(`^${decodedName}$`, 'i') }).populate('players').exec();
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(team);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error fetching team', 
            error: error.message || 'Unknown error' 
        });
    }
}

// 6. Update a team by ID
exports.updateTeam = async (req, res) => {

    try {
       
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const allowedFields = [
            'team_code',
            'team_name',
            'owners',
            'head_coach',
            'support_staff',
            'captain',
            'championships',
            'team_theme_color',
            'team_logo',
            'team_name_bg',
            'venue',
        ];

        const updateFields = Object.fromEntries(
            Object.entries(req.body).filter(([key, value]) =>
                allowedFields.includes(key) && value !== undefined
            )
        );
        // players id mapping
        if (req.body.players) {
            const playersExists = await PlayerIdMapper(req.body.players);
            if (playersExists.error) {
                return res.status(400).json({
                    message: playersExists.message,
                    missingPlayers: playersExists.missingPlayers
                });
            }
            updateFields.players = Object.values(playersExists.validPlayers);
        }


        const updatedTeam = await Team.findByIdAndUpdate(id, updateFields, {
            new: true
        }).populate({
            path: 'players',
            select: '-_id name'
        }).exec();

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(updatedTeam);
    } catch (error) {
        console.error('Error updating team:', error.message);
        res.status(400).json({
            message: 'Error updating team',
            error: error.message || 'Unknown error'
        });
    }
};

// 7. Delete a team by ID
exports.deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const deletedTeam = await Team.findByIdAndDelete(id).exec();
        if (!deletedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(400).json({ 
            message: 'Error deleting team', 
            error: error.message || 'Unknown error' 
        });
    }
}

// 8. Remove player from team
exports.removePlayerFromTeam = async (req, res) => {
    try {
        const { teamId, playerId } = req.body;
        if (!ObjectId.isValid(teamId) || !ObjectId.isValid(playerId)) {
            return res.status(400).json({ message: 'Invalid team or player ID' });
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { $pull: { players: playerId } },
            { new: true }
        ).populate('players').exec();

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(updatedTeam);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error removing player from team', 
            error: error.message || 'Unknown error' 
        });
    }
}

// 9. Add player to team
exports.addPlayerToTeam = async (req, res) => {
    try {
        const { teamId, playerId } = req.params;
        if (!ObjectId.isValid(teamId) || !ObjectId.isValid(playerId)) {
            return res.status(400).json({ message: 'Invalid team or player ID' });
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { $addToSet: { players: playerId } },
            { new: true }
        ).populate('players').exec();

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json(updatedTeam);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error adding player to team', 
            error: error.message || 'Unknown error' 
        });
    }
}