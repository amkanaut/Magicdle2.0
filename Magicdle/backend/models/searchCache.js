const mongoose = require('mongoose');

const searchCacheSchema = new mongoose.Schema({
    // Exact combination of search terms (e.g, "card name")
    queryKey: { type: String, required:true, unique: true},

    // Strip the result down from Scryfall

    results: { type: Array, required: true},

    // Time to live index: Delete the cache after certain amount of time

    expiresAt: { type: Date, required: true, expires: 0}
});