import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    address: String,
    lat: Number,
    lng: Number,
    score: Number,
});

export const Location = mongoose.model('Location', locationSchema);