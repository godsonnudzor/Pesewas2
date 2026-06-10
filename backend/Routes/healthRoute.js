import express from "express";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";
import multer from "multer";
import path from "path";
import { supabase, isSupabaseConfigured } from "../lib/SupabaseClient.js";

const router = express.Router();
router.get("/api/health", async (req, res) => {
  try {
    const supabaseUrlSet =
      Boolean(process.env.SUPABASE_URL) ||
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
      Boolean(process.env.VITE_SUPABASE_URL);
    const supabaseKeySet =
      Boolean(process.env.SUPABASE_ANON_KEY) ||
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
      Boolean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

    const health = {
      server: "running",
      timestamp: new Date().toISOString(),
      supabaseConfigured: isSupabaseConfigured,
      supabaseUrl: supabaseUrlSet ? "set" : "missing",
      supabaseKey: supabaseKeySet ? "set" : "missing",
    };

    if (!isSupabaseConfigured) {
      return res.status(503).json({
        status: "error",
        message: "Supabase is not configured",
        details: health,
      });
    }

    // Try to connect to Supabase
    const { data, error } = await supabase
      .from("account_types")
      .select("id")
      .limit(1);

    if (error) {
      return res.status(503).json({
        status: "error",
        message: "Failed to connect to Supabase",
        error: error.message,
        details: health,
      });
    }

    res.status(200).json({
      status: "ok",
      message: "Server and Supabase are working",
      details: health,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message,
    });
  }
});

export {router as HealthRouter}