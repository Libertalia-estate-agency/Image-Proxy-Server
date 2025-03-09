const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

/**
 * Convert Image URL to Base64
 */
async function imageToBase64(imageUrl) {
  try {
    console.log("Image URL : " + JSON.stringify(imageUrl));
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    console.log("Response: " + JSON.stringify(response));
    return Buffer.from(response.data, "binary").toString("base64");
  } catch (error) {
    console.error("Error converting image:", error);
    return null;
  }
}

/**
 * API Route: Convert Image URL to Base64
 */
app.post("/convert", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

  const base64Image = await imageToBase64(imageUrl);
  if (!base64Image) return res.status(500).json({ error: "Failed to convert image" });

  res.json({ base64: base64Image });
});

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
