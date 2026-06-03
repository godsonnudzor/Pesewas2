import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import {supabase, isSupabaseConfigured} from './lib/SupabaseClient.js';



const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", async (req, res) => {
  try {
    const health = {
      server: "running",
      timestamp: new Date().toISOString(),
      supabaseConfigured: isSupabaseConfigured,
      supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
      supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "set" : "missing",
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


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});