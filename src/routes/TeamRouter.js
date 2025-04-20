const express = require('express');
const router = express.Router();
const teamController = require('../controller/TeamController');


router.post('/add-team', teamController.createTeam);
router.post('/bulk-team-create', teamController.bulkUploadTeams); 
router.get('/get-teams', teamController.getAllTeams); 
router.get('/get-team/:id', teamController.getTeamById); 
router.get('/get-team-by-name/:teamname', teamController.getTeamByName); 
router.put('/update-team/:id', teamController.updateTeam); 
router.delete('/delete-team/:id', teamController.deleteTeam); 
router.put('/remove-player', teamController.removePlayerFromTeam);
router.put('/add-player', teamController.addPlayerToTeam); 

module.exports = router;