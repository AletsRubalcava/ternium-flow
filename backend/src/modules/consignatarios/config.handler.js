// config.handler.js
export function getConfigHandler(req, res) {
    return res.status(200).json({
        googleApiKey: process.env.GOOGLE_API_KEY
    });
}