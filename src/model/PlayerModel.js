const mongoose = require('mongoose');
const { Schema } = mongoose;

const playerSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    age: { 
        type: Number, 
        required: true 
    },
    skill: {
        type: String,
        enum: {
          values: ['Batter', 'Bowler', 'All-Rounder','WK-Batter'],
          message: '{VALUE} is not a valid skill',
        },
        required: true
    },
    dob:{
        type: Date,
    },
    debut:{
        type: Date,  
    },
    image: {
        type: String,
    },
    matches_played: { 
        type: Number, 
    },
    runs: { 
        type: Number, 
    },
    wickets: { 
        type: Number, 
    },
    nationality: {
        type: String,
    },

}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);