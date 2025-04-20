const express = require('express');
const router = express.Router();
const userRouter = require('../controller/UserController');
const authenticate = require('../middleware/authenticate');


router.post("/signup",userRouter.createUser); 
router.post("/login",userRouter.loginUser);
router.get("/currentuser", authenticate, userRouter.getCurrentUser);
router.put("/updateuser/:id", userRouter.updateUserProfile);
router.post("/forgot-password",userRouter.forgotPassword);
router.post("/reset-password/:token",userRouter.resetPassword);
router.post("/google-login",userRouter.googleLogin);
router.post("/logout",userRouter.logoutUser);



module.exports = router;
