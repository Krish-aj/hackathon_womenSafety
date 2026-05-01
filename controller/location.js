// controller/location.js

import { Location } from '../models/Location.js';

export const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find({},
            {_id:0,address:1,lat:1,lng:1,score:1});

        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const handleLocationUpdate = async (req, res) => {
    try {
        const { userId, lat, lng } = req.body;

        if (!userId || isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ error: 'userId, lat, and lng are required' });
        }

        // Find the closest high-risk location from seeded data
        const locations = await Location.find({});
        let nearestRisk = null;
        let minDist = Infinity;

        for (const loc of locations) {
            const dist = Math.sqrt(
                Math.pow(loc.lat - lat, 2) +
                Math.pow(loc.lng - lng, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                nearestRisk = loc;
            }
        }

        const payload = {
            userId,
            currentLocation: { lat, lng },
            nearestRiskZone: nearestRisk,
            distanceToRisk: minDist,
            alert: nearestRisk?.score > 7   // tweak threshold to your score range
                ? `⚠️ High risk area nearby: ${nearestRisk.address}`
                : null,
        };

        // Broadcast to all connected dashboard/guardian clients
        const io = req.app.get('socketio');
        io.emit('location-update', payload);

        res.json({ success: true, ...payload });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};