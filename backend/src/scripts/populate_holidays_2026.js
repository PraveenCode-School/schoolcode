require('dotenv').config();
const { pool } = require('../config/db');

// List of major Karnataka/Indian Holidays for 2026
const holidays2026 = [
    { date: '2026-01-15', title: 'Makara Sankranti / Pongal' },
    { date: '2026-01-26', title: 'Republic Day' },
    { date: '2026-02-15', title: 'Maha Shivaratri' },
    { date: '2026-03-04', title: 'Holi' },
    { date: '2026-03-19', title: 'Ugadi (Karnataka New Year)' },
    { date: '2026-03-20', title: 'Ramzan (Id-ul-Fitr) *Tentative' },
    { date: '2026-04-03', title: 'Good Friday' },
    { date: '2026-04-14', title: 'Dr. Ambedkar Jayanti' },
    { date: '2026-05-01', title: 'May Day / Labour Day' },
    { date: '2026-05-27', title: 'Bakrid / Eid al-Adha *Tentative' },
    { date: '2026-08-15', title: 'Independence Day' },
    { date: '2026-09-14', title: 'Ganesh Chaturthi' },
    { date: '2026-10-02', title: 'Gandhi Jayanti' },
    { date: '2026-10-20', title: 'Maha Navami / Ayudha Puja' },
    { date: '2026-10-21', title: 'Vijayadashami / Dussehra' },
    { date: '2026-11-01', title: 'Kannada Rajyotsava' },
    { date: '2026-11-08', title: 'Deepavali (Naraka Chaturdashi)' },
    { date: '2026-11-10', title: 'Bali Padyami (Deepavali)' },
    { date: '2026-12-25', title: 'Christmas' }
];

async function populateHolidays() {
    const client = await pool.connect();
    try {
        console.log('=== POPULATING 2026 HOLIDAYS ===');

        // We'll use school_id = 1 (assuming single school or primary school)
        const SCHOOL_ID = 1;

        let addedCount = 0;
        let skippedCount = 0;

        for (const holiday of holidays2026) {
            // Check if holiday already exists to avoid duplicates
            const check = await client.query(
                `SELECT id FROM events 
                 WHERE school_id = $1 AND start_date = $2 AND title = $3`,
                [SCHOOL_ID, holiday.date, holiday.title]
            );

            if (check.rows.length === 0) {
                // Insert new holiday event
                await client.query(
                    `INSERT INTO events 
                    (school_id, title, event_type, start_date, end_date, description, audience)
                    VALUES ($1, $2, 'Holiday', $3, $3, 'Public Holiday', 'All')`,
                    [SCHOOL_ID, holiday.title, holiday.date]
                );
                console.log(`✅ Added: ${holiday.date} - ${holiday.title}`);
                addedCount++;
            } else {
                console.log(`⚠️  Skipped (Exists): ${holiday.date} - ${holiday.title}`);
                skippedCount++;
            }
        }

        console.log('\n=== SUMMARY ===');
        console.log(`Total Holidays Processed: ${holidays2026.length}`);
        console.log(`Added: ${addedCount}`);
        console.log(`Skipped (Already Existed): ${skippedCount}`);

        console.log('\nNOTE: Now go to "Holiday Management" and click "Sync from Calendar" to use these for attendance!');

    } catch (error) {
        console.error('❌ Error populating holidays:', error);
    } finally {
        client.release();
        process.exit(0);
    }
}

populateHolidays();
