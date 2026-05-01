import { Location } from '../models/Location.js';

// 1. Get ALL locations (For your mobile dev friend's initial load)
export const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find({}, 'lat lng score address');
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data" });
    }
};

// 2. Handle specific User Update (Broadcasting to Frontend Map)
export const handleLocationUpdate = async (req, res) => {
    const { userId, lat, lng } = req.body;

    try {
        const io = req.app.get('socketio');
        
        const userData = {
            userId,
            lat,
            lng,
            type: "USER_LIVE_LOCATION"
        };

        // Send to frontend dashboard immediately via Socket.io
        if (io) {
            io.emit('userMoved', userData);
        }

        res.status(200).json({ message: "Location broadcasted to map" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};