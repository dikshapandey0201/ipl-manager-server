const User = require('../model/UserModel');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
        return res.status(401).json({ success:false, message: 'Token not found' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
        return res.status(401).json({ success:false, message: 'Unauthorized' });
        }
        const { id } = decoded;
        const user = await User.findById(id).select("-password");
        if (!user) {
        return res.status(401).json({ success:false, message: 'Unauthorized' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = authenticate;