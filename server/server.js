const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

app.post("/api/restaurants", async (req, res) => {
    try {
        const { place, range } = req.body;
        if (!place || !range) {
            return res.status(400).json({ message: "Place and range are required" });
        }

        // Fetch location coordinates from OpenStreetMap
        const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { format: "json", q: place },
        });

        if (!geoResponse.data.length) {
            return res.status(404).json({ message: "Location not found" });
        }

        const { lat, lon } = geoResponse.data[0];

        // Fetch restaurants from Overpass API
        const overpassQuery = `
            [out:json];
            node["amenity"="restaurant"](around:${range},${lat},${lon});
            out;
        `;
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
        const overpassResponse = await axios.get(overpassUrl);

        const restaurants = overpassResponse.data.elements.map((r) => ({
            name: r.tags.name || "Unknown",
            address: `${r.tags["addr:housenumber"] || ""} ${r.tags["addr:street"] || "No Address"}, ${r.tags["addr:city"] || ""}`.trim(),
            phone: r.tags["contact:phone"] || r.tags["phone"] || "No phone available",
            website: r.tags["contact:website"] || r.tags["website"] || "No website available",
            email: r.tags["contact:email"] || "No email available",
            opening_hours: r.tags["opening_hours"] || "No opening hours available",
            facebook: r.tags["contact:facebook"] || "No Facebook",
            instagram: r.tags["contact:instagram"] || "No Instagram",
            lat: r.lat,
            lon: r.lon,
        }));

        res.json(restaurants);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
