import express from "express";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";
import multer from "multer";
import path from "path";
import { supabase } from "../lib/SupabaseClient.js";

const router = express.Router();

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
    const passwordMatch = await bcrypt.compare(password, data.password);

    if (!passwordMatch) {
      return res.json({ loginStatus: false, Error: "Wrong Password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { role: "admin", email: data.email, id: data.id },
      "secret_key_jwt",
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