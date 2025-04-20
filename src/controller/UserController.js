const User = require('../model/UserModel');
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");



// 1. Create a new user
exports.createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Created successfully, please login to continue",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 2. Login a user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ success: false, message: "User Not Found" });
    }
    const validUser = await bcryptjs.compare(password, user.password);
    if (!validUser) {
      return res.status(409).json({ success: false, message: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'None'
      })
      .status(201)
      .json({ success: true, message: "Logged in successfully" });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// // 3. Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "Welcome back!", user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 4. Logout a user
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("access_token");
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// 5. Google Auth
exports.googleLogin = async (req, res) => {
  const { email, name} = req.body; 
  try {
    // Check if the user already exists in the database
    let existingUser = await User.findOne({ email }).select("-password");

    if (existingUser) {
      // User exists, return user data
      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: existingUser,
      });
    } else {
      // User does not exist, create a new user
      const hashedPassword = await bcryptjs.hash("password123", 10); // Hash a default password
      const newUser = new User({ ...req.body, password: hashedPassword }); // Create a new user instance
      

      const response  = await newUser.save(); // Save the new user to the database
      const userInfo = {
        _id: response._id,
        name: response.name,
        email: response.email,
      }
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: userInfo,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 6. Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const updated = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("-password");
    res
      .status(200)
      .json({ success: true, message: "Profile updated", user: updated });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 7. forgot password
exports.forgotPassword = async (req, res) =>{
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    var mailOptions = {
      from: process.env.EMAIL,
      to:email,
      subject: "Reset Password",
      html: `
              <div style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                  <!-- Company Logo -->
                  <div style="text-align: center;">
                    <img src="https://res.cloudinary.com/dmtjstddn/image/upload/v1745083847/iplLogoblue_k92ouy.png" alt="Company Logo" style="width: 150px;">
                    <h3>IPL Manager</h3>
                  </div>
        
                  <!-- Email Greeting -->
                  <h2 style="text-align: center; color:rgb(78, 76, 175);">Reset Your Password</h2>
        
                  <!-- Main Body -->
                    <p>Hello,</p>
                    <p>You recently requested to reset your password for your account. Click the button below to reset it. If you did not request a password reset, please ignore this email.</p>
        
                  <!-- Call to Action Button -->
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="http://localhost:5173/reset-password/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Your Password</a>
                  </div>
        
                  <!-- Security Reminder -->
                  <p style="color: #999;">If you didn't request a password reset, you can safely ignore this email. Your password won't be changed unless you click the link above.</p>
        
                  <!-- Footer -->
                  <div style="border-top: 1px solid #eaeaea; padding-top: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>If you have any questions, feel free to contact us at <a href="mailto:support@yourcompany.com">support@iplmanager.com</a>.</p>
                    <p>&copy; 2024 IPL Manager</p>
                  </div>
                </div>
              </div>
              `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        
        res.status(400).json({ success: false, message: "Email not sent" });
      } else {
        res.status(200).json({ success: true, message: "Email sent successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


// 8. Reset password

exports.resetPassword =async(req, res)=> {
  try {
      const token = req.params.token;
      const { password } = req.body;


      if (!token) {
          return res.send({ success: false, message: "Token not found" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);

      if (!user) {
          return res.send({ success: false, message: "User not found" });
      }


      const hashedPassword = bcryptjs.hashSync(password, 10);

      await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });

      var mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Password Reset Successful",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
              
              <!-- Company Logo -->
              <div style="text-align: center;">
                <img src="https://res.cloudinary.com/dmtjstddn/image/upload/v1745083847/iplLogoblue_k92ouy.png" alt="Company Logo" style="width: 150px;">
                <h3>Team IPL</h3>
              </div>
      
              <!-- Email Greeting -->
              <h2 style="text-align: center; color: #4CAF50;">Password Reset Successful</h2>
      
              <!-- Main Body -->
              <p>Hello,</p>
              <p>Your password has been successfully reset. You can now log in using your new password.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="http://localhost:5173/" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a>
              </div>
      
              <!-- Reminder -->
              <p>If you didn’t reset your password or believe this was done in error, please contact our support team immediately.</p>
      
              <!-- Footer -->
              <div style="border-top: 1px solid #eaeaea; padding-top: 20px; text-align: center; font-size: 12px; color: #999;">
                <p>If you have any questions, feel free to contact us at <a href="mailto:support@iplmanager.com">support@iplmanager.com</a>.</p>
                <p>&copy; 2025 IPL Manager</p>
              </div>
            </div>
          </div>
        `,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          
          res.send({ success: false, message: "Email not sent" });
        } else {
          res.send({ success: true, message: "Email sent successfully" });
        }
      });

      res.send({ success: true, message: "Password reset successfully" });
  } catch (error) {
      if (error.name === 'TokenExpiredError') {
          return res.send({ success: false, message: "Token has expired" });
      }
      if (error.name === 'JsonWebTokenError') {
          return res.send({ success: false, message: "Invalid token" });
      }
      res.status(500).send({ success: false, message: "Internal server error" });
  }
}
