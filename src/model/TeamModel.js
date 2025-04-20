const mongoose = require('mongoose');
const { Schema } = mongoose;

const teamSchema = new Schema({
    team_code: { 
        type: String, 
        required: true,
        unique: true, 
    },
    team_name: { 
        type: String, 
        required: true 
    },
    owners: { 
        type: String,
    },
    head_coach: { 
        type: String, 
        required: true 
    },
    support_staff: [{type: String }],
    team_logo:{
        type: String,
        default: null
    },
    team_name_bg:{
        type: String,
        default: null
    },
    team_theme_color:{
        type: String,
        default: null
    },
    championships: [{type: String}],
    captain: { 
        type: String, 
        required: true 
    },
    venue: {type: String},
    players: [{type: Schema.Types.ObjectId, ref: 'Player' }],

    
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
