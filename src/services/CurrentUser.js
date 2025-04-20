const CurrentUser = async (req, res) => {
    try {
      return res
        .status(200)
        .json({ success: true, message: "Welcome back!", user: req.user });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  module.exports = CurrentUser;