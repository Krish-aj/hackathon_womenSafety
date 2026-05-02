import { Location } from '../models/Location.js';

// ── Haversine: returns distance in METRES between two GPS points ──
const haversineMetres = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Risk label based on score + proximity ────────────────────────
const getRiskLevel = (score, distanceMetres) => {
    // If nearest risk zone is more than 600m away → safe regardless of score
    if (distanceMetres > 600) return { level: 'LOW',      emoji: '🟢' };

    // Zone is within 600m — now check the score (adjust range to your data)
    if (score >= 9)            return { level: 'CRITICAL',  emoji: '🔴' };
    if (score >= 6)            return { level: 'HIGH',      emoji: '🟠' };
    if (score >= 4)            return { level: 'MODERATE',  emoji: '🟡' };
    return                            { level: 'LOW',       emoji: '🟢' };
};


export const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find(
            {},
            { _id: 0, address: 1, lat: 1, lng: 1, score: 1 }
        );
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const handleLocationUpdate = async (req, res) => {
    try {
        let { lat, lng, riskScore } = req.body;

        lat = Number(lat);
        lng = Number(lng);

        console.log("📍 Incoming:", lat, lng, riskScore);

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ error: "Invalid coordinates" });
        }

        const locations = await Location.find({});

        // ── Find nearest risk zone using real distance ────────────
        let nearestRisk = null;
        let minDistMetres = Infinity;

        for (const loc of locations) {
            const dist = haversineMetres(lat, lng, loc.lat, loc.lng);
            if (dist < minDistMetres) {
                minDistMetres = dist;
                nearestRisk   = loc;
            }
        }

        // ── Determine risk level ──────────────────────────────────
        const { level, emoji } = getRiskLevel(
            nearestRisk?.score ?? 0,
            minDistMetres
        );

        const alert =
            level === 'CRITICAL' ? `🔴 CRITICAL: High-risk zone within ${Math.round(minDistMetres)}m — ${nearestRisk.address}` :
            level === 'HIGH'     ? `🟠 HIGH: Risk area ${Math.round(minDistMetres)}m away — ${nearestRisk.address}` :
            level === 'MODERATE' ? `🟡 MODERATE: Stay alert near ${nearestRisk.address}` :
            null; // no alert for LOW

        const payload = {
            currentLocation:  { lat, lng },
            nearestRiskZone:  nearestRisk,
            distanceMetres:   Math.round(minDistMetres),
            userRiskScore:    riskScore,
            riskLevel:        level,
            emoji,
            alert,
        };

        // ── Broadcast to dashboard ────────────────────────────────
        const io = req.app.get('socketio');
        io.emit('location-update', payload);

        res.json({ success: true, ...payload });

    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ error: err.message });
    }
};