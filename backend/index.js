import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import {supabase, isSupabaseConfigured} from './lib/SupabaseClient.js';
import { AdminRouter } from './Routes/adminRoute.js';
import { AuthRouter } from './Routes/authRoute.js';
import { HealthRouter } from './Routes/healthRoute.js';
import { EmployeeRouter } from './Routes/employees.js';



const app = express();
app.use(cors());
app.use(express.json());
app.use('/health', HealthRouter);
app.use('/api/auth', AuthRouter);
app.use('/admin', AdminRouter);
app.use('/employee', EmployeeRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});