import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/error.middleware.js";
import User from "../Models/User.js";

const authCookieName = "auth_token";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "sindhu-agencies-secret-2025", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !password || (!email && !phone)) {
    res.status(400);
    throw new Error("Name, password, and either email or phone are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email: email?.toLowerCase() }, { phone }].filter((item) =>
      Object.values(item)[0]
    ),
  });
  if (existingUser) {
    res.status(400);
    throw new Error("User with this email or phone already exists");
  }

  const hasUsers = (await User.countDocuments()) > 0;
  const user = await User.create({
    name,
    email: email?.toLowerCase(),
    phone,
    password,
    role: hasUsers ? "user" : role || "admin",
  });

  const token = generateToken(user._id);
  res.cookie(authCookieName, token, getCookieOptions());

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    res.status(400);
    throw new Error("Email or phone, and password are required");
  }

  const user = await User.findOne(
    email ? { email: email.toLowerCase() } : { phone }
  ).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email/phone or password");
  }

  const token = generateToken(user._id);
  res.cookie(authCookieName, token, getCookieOptions());

  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: sanitizeUser(req.user),
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(authCookieName, {
    ...getCookieOptions(),
    maxAge: undefined,
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});
