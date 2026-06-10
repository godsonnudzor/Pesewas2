import express from "express";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";
import multer from "multer";
import path from "path";
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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Query Supabase for admin user by email
    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.json({ loginStatus: false, Error: "Wrong Email or Password" });
    }

    // Compare password with stored hash
    const passwordMatch = await verifyPassword(password, data.password);

    if (!passwordMatch) {
      return res.json({ loginStatus: false, Error: "Wrong Password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { role: "admin", email: data.email, id: data.id },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.cookie("token", token);
    return res.json({ loginStatus: true, id: data.id });
  } catch (err) {
    console.error("Login error:", err);
    return res.json({ loginStatus: false, Error: "Query Error" });
  }
});

export {router as AdminRouter}