const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

dotenv.config();

const connectDB = require('./src/config/DbConnection');
const teamRouter = require('./src/routes/TeamRouter');
const playerRouter = require('./src/routes/PlayerRouter');
const userRouter = require('./src/routes/UserRoutes'); 

connectDB();

const app = express();

// app.use(cors());
app.use(cors({
  origin: 'https://ipl-manager-client.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials:true
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/team', teamRouter);
app.use('/api/player', playerRouter); 
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
