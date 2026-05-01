import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    address: String,
    lat: Number,
    lng: Number,
    score: Number,
},
{
    versionKey: false // 🔥 removes __v completely
  }
);

export const Location = mongoose.model('Location', locationSchema);