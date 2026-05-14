// authMiddleware.js
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // This is where the error happens if secrets don't match
      const decoded = jwt.verify(token, process.env.JWT_SECRET); 

      req.user = decoded;
      return next();
    } catch (error) {
      console.error("❌ JWT Error Details:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};