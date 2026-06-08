import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabase } from "../lib/SupabaseClient.js";

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "secret_key_jwt";

const findUserByEmail = async (email) => {
  const { data: adminUser, error: adminError } = await supabase
    .from("admin")
    .select("*")
    .eq("email", email)
    .single();

  if (!adminError && adminUser) {
    return { user: adminUser, role: "admin" };
  }

  const { data: employeeUser, error: employeeError } = await supabase
    .from("employee")
    .select("*")
    .eq("email", email)
    .single();

  if (!employeeError && employeeUser) {
    return { user: employeeUser, role: "employee" };
  }

  return null;
};

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const found = await findUserByEmail(email);
    if (!found) {
      return res.status(401).json({ success: false, error: "Wrong Email or Password" });
    }

    const passwordMatch = await bcrypt.compare(password, found.user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Wrong Email or Password" });
    }

    const token = jwt.sign(
      {
        role: found.role,
        email: found.user.email,
        id: found.user.id,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: found.user.id,
        email: found.user.email,
        role: found.role,
      },
    });
  } catch (error) {
    console.error("Auth login error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Missing auth token" });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    return res.json({ success: true, user: decoded });
  });
});

export { router as AuthRouter };
