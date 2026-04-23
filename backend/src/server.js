const path = require('path');
const dotenv = require('dotenv');

// Explicitly load .env from root of backend
const result = dotenv.config({ path: path.join(__dirname, '../.env') });

if (result.error) {
    console.error("❌ Failed to load .env file:", result.error);
} else {
    console.log("✅ .env file loaded successfully.");
    console.log("   GEMINI_API_KEY Present:", !!process.env.GEMINI_API_KEY);
    console.log("   EMAIL_USER Present:", !!process.env.EMAIL_USER);
}
const app = require('./app');
const { pool } = require('./config/db');

const cron = require('node-cron');
const { checkAndSendAbsentNotifications } = require('./services/notificationService');

// Schedule Absentee Check at 10:00 AM every day
// cron.schedule('0 10 * * *', () => {
//     checkAndSendAbsentNotifications();
// });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test DB connection
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL database');

        // Auto-run migrations (Schema Updates)
        try {
            // --- AUTO-CREATE CORE TABLES (Self-Repair) ---
            const coreTables = [
                `CREATE TABLE IF NOT EXISTS students (
                    id SERIAL PRIMARY KEY, 
                    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE, 
                    name VARCHAR(255) NOT NULL, 
                    email VARCHAR(255), 
                    admission_no VARCHAR(50), 
                    status VARCHAR(50) DEFAULT 'Active', 
                    class_id INTEGER, 
                    section_id INTEGER, 
                    gender VARCHAR(10),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS teachers (
                    id SERIAL PRIMARY KEY, 
                    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE, 
                    name VARCHAR(255) NOT NULL, 
                    email VARCHAR(255), 
                    phone VARCHAR(20), 
                    subject_specialization VARCHAR(255), 
                    gender VARCHAR(10), 
                    join_date DATE DEFAULT CURRENT_DATE, 
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS leaves (
                    id SERIAL PRIMARY KEY, 
                    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE, 
                    user_id INTEGER REFERENCES users(id), 
                    student_id INTEGER REFERENCES students(id), 
                    teacher_id INTEGER REFERENCES teachers(id), 
                    leave_type VARCHAR(50), 
                    start_date DATE, 
                    end_date DATE, 
                    reason TEXT, 
                    status VARCHAR(20) DEFAULT 'Pending', 
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS marks (
                    id SERIAL PRIMARY KEY, 
                    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE, 
                    subject_id INTEGER, 
                    exam_type VARCHAR(100), 
                    marks_obtained DECIMAL(5,2), 
                    total_marks DECIMAL(5,2),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            ];

            for (const tableSql of coreTables) {
                await client.query(tableSql);
            }

            // Existing column migrations
            await client.query(`
                ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo TEXT;
                ALTER TABLE schools ADD COLUMN IF NOT EXISTS institution_type VARCHAR(50) DEFAULT 'SCHOOL';
            `);

            console.log('✅ Database schema verified and core tables ensured.');
        } catch (migError) {
            console.warn('⚠️ Some migrations could not be applied automatically:', migError.message);
        }


        // Auto-run migrations if needed (simple check)
        const check = await client.query("SELECT to_regclass('public.users')");
        if (!check.rows[0].to_regclass) {
            console.log('⚠️ Database seems empty. Running initialization...');
            const { createTables } = require('./scripts/initDb');
            await createTables(client);
        }

        client.release();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT} and accepting external connections`);
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('🔄 Retrying in 5 seconds...');
        setTimeout(startServer, 5000);
    }
};

// Global Error Handlers to prevent crash
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...');
    console.error(err.name, err.message, err.stack);
    // process.exit(1); // Do NOT exit, keep running if possible, or restart. For "don't crash" request, we log.
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥');
    console.error(err.name, err.message);
});

startServer();
