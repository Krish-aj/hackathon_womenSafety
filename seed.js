import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Location } from './models/Location.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// ── helper: pick the first key that exists and has a real value ──
const pick = (obj, ...keys) => {
    for (const key of keys) {
        const val = obj[key] ?? obj[key.toLowerCase()] ?? obj[key.toUpperCase()];
        if (val !== undefined && val !== null && val !== '') return val;
    }
    return undefined;
};

const seedDatabase = async () => {
    try {
        const uri = "mongodb://admin:pass@localhost:27017/women_safety?authSource=admin";
        console.log("Connecting to Docker MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Database Connected.");

        const results  = [];
        const skipped  = [];
        const csvFilePath = path.resolve(__dirname, 'your_scrapped_data.csv');

        // ── Step 1: peek at the actual column headers ────────────────
        let headersLogged = false;

        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('headers', (headers) => {
                    console.log('\n📋 CSV columns found:', headers);
                })
                .on('data', (row) => {
                    // Log the first raw row so you can see exact key names
                    if (!headersLogged) {
                        console.log('🔍 First raw row:', row);
                        headersLogged = true;
                    }

                    // ── Try every likely column name variant ──────────
                    const rawLat   = pick(row, 'Latitude');
const rawLng   = pick(row, 'Longitude');
const rawScore = pick(row, 'Risk Score');
const address  = pick(row, 'Area Name') ?? '';

                    const lat   = parseFloat(rawLat);
                    const lng   = parseFloat(rawLng);
                    const score = parseFloat(rawScore);   // use parseFloat for consistency

                    // ── Guard: skip rows with invalid numbers ─────────
                    if (isNaN(lat) || isNaN(lng) || isNaN(score)) {
                        skipped.push({ rawLat, rawLng, rawScore, address });
                        return;
                    }

                    results.push({ address, lat, lng, score });
                })
                .on('end',   resolve)
                .on('error', reject);
        });

        // ── Step 2: report what was skipped ──────────────────────────
        if (skipped.length > 0) {
            console.warn(`\n⚠️  Skipped ${skipped.length} rows with missing/invalid data:`);
            skipped.slice(0, 5).forEach((s, i) =>
                console.warn(`   Row ${i + 1}:`, s)
            );
            if (skipped.length > 5) console.warn(`   ...and ${skipped.length - 5} more`);
        }

        // ── Step 3: bail out if nothing valid ────────────────────────
        if (results.length === 0) {
            console.error('\n❌ No valid rows found. Check the column names printed above.');
            console.error('   Update the pick() call in seed.js to match your CSV headers.');
            await mongoose.connection.close();
            process.exit(1);
        }

        // ── Step 4: seed ──────────────────────────────────────────────
        await Location.deleteMany({});
        await Location.insertMany(results);
        console.log(`\n🚀 Seeded ${results.length} locations successfully!`);

        await mongoose.connection.close();
        console.log('🔒 Connection closed.');

    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedDatabase();