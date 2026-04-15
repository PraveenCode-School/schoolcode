require('dotenv').config();
const { pool } = require('../config/db');

async function populateSundays() {
    const client = await pool.connect();
    try {
        console.log('=== POPULATING SUNDAYS FOR 2026 ===');

        const SCHOOL_ID = 1;
        const year = 2026;
        let addedCount = 0;
        let skippedCount = 0;

        // Loop through all days in 2026
        for (let month = 0; month < 12; month++) {
            // Get number of days in the month
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);

                // Check if it is Sunday (0)
                if (date.getDay() === 0) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                    // Check if exists
                    const check = await client.query(
                        `SELECT id FROM events 
                         WHERE school_id = $1 AND start_date = $2`,
                        [SCHOOL_ID, dateStr]
                    );

                    if (check.rows.length === 0) {
                        await client.query(
                            `INSERT INTO events 
                            (school_id, title, event_type, start_date, end_date, description, audience)
                            VALUES ($1, 'Sunday', 'Holiday', $2, $2, 'Weekly Holiday', 'All')`,
                            [SCHOOL_ID, dateStr]
                        );
                        console.log(`✅ Added Sunday: ${dateStr}`);
                        addedCount++;
                    } else {
                        // console.log(`⚠️  Skipped (Exists): ${dateStr}`);
                        skippedCount++;
                    }
                }
            }
        }

        console.log('\n=== SUMMARY ===');
        console.log(`Sundays Added: ${addedCount}`);
        console.log(`Skipped (Already Existed): ${skippedCount}`);

    } catch (error) {
        console.error('❌ Error populating Sundays:', error);
    } finally {
        client.release();
        process.exit(0);
    }
}

populateSundays();
