import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Location } from './models/Location.js';

// Manually resolve the path to the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const seedDatabase = async () => {
    try {
        // Hardcode the string directly since .env is failing to load
        const uri = "mongodb://admin:pass@localhost:27017/women_safety?authSource=admin";
        
        console.log("Connecting to Docker MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Database Connected.");

        const results = [];
        const csvFilePath = path.resolve(__dirname, 'your_scrapped_data.csv'); 

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    address: data.address || data.Address,
                    lat: parseFloat(data.lat || data.latitude),
                    lng: parseFloat(data.lng || data.longitude),
                    score: parseInt(data.score || data.safety_score)
                });
            })
            .on('end', async () => {
                await Location.deleteMany({}); 
                await Location.insertMany(results);
                console.log(`🚀 Successfully seeded ${results.length} locations!`);
                mongoose.connection.close();
            });

    } catch (error) {
        console.error("❌ Seeding Error:", error.message);
        process.exit(1);
    }
};

seedDatabase();