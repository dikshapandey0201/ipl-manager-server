const express = require('express');
const router = express.Router();

const playerController = require('../controller/PlayerController');

router.post('/add-player', playerController.createPlayer);
router.post('/bulk-add-players', playerController.bulkAddPlayers);
router.get('/get-all-players', playerController.getAllPlayers); 
router.get('/get-player/:id', playerController.getPlayerById); 
router.get('/get-player-by-name/:name', playerController.getPlayersByName); 
router.put('/update-player/:id', playerController.updatePlayer); 
router.delete('/delete-player/:id', playerController.deletePlayer);

module.exports = router;