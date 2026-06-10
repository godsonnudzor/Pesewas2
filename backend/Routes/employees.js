import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabase } from "../lib/SupabaseClient.js";

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "secret_key_jwt";

const isBcryptHash = (value) => typeof value === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
const verifyPassword = async (plainPassword, storedPassword) => {
  if (isBcryptHash(storedPassword)) {
    return await bcrypt.compare(plainPassword, storedPassword);
  }
  return plainPassword === storedPassword;
};

router.post("/employee_login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ loginStatus: false, Error: "Email and password are required" });
    }

    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.json({ loginStatus: false, Error: "Wrong Email or Password" });
    }

    const passwordMatch = await verifyPassword(password, data.password);
    if (!passwordMatch) {
      return res.json({ loginStatus: false, Error: "Wrong Email or Password" });
    }

    const token = jwt.sign(
      { role: "employee", email: data.email, id: data.id },
      jwtSecret,
      { expiresIn: "2d" }
    );

    return res.json({
      loginStatus: true,
      id: data.id,
      token,
      user: {
        id: data.id,
        email: data.email,
        role: "employee",
      },
    });
  } catch (err) {
    console.error("Employee login error:", err);
    return res.status(500).json({ loginStatus: false, Error: "Internal Server Error" });
  }
});

router.get('/detail/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(500).json({ Status: false, error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error("Employee detail error:", err);
    return res.status(500).json({ Status: false, error: "Internal Server Error" });
  }
});

router.get('/logout', (req, res) => {
  return res.json({ status: true });
});

export { router as EmployeeRouter }