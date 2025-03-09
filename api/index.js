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
/**
async function imageToBase64(imageUrl) {
  try {
    console.log("Image URL : " + JSON.stringify(imageUrl));

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    //console.log("Response : " + JSON.stringify(response));
    
    const base64Image = Buffer.from(response.data).toString("base64");
    //console.log("Base64 Image : " + JSON.stringify(base64Image));
    // Get the image type (e.g., "jpeg", "png")
    const contentType = response.headers["content-type"];
    //console.log("Content Type : " + JSON.stringify(contentType));
    

    //console.log("Base64 Data URL : " + JSON.stringify(`data:${contentType};base64,${base64Image}`));
    // Format as a full Base64 data URL
    return `data:${contentType};base64,${base64Image}`; 


  } catch (error) {
    console.error("Error converting image:", error.message);
    return null;
  }
} 
 */

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Image Proxy Server</h1><p>Use the <code>/convert</code> endpoint to convert images to Base64.</p>");
});

async function imageToBase64(imageUrl) {
  try {
    
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    
    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    
    const contentType = response.headers["content-type"];

    return `${base64Image}`;
  } catch (error) {
    console.error("Error converting image:", error.message); // Only log the error message
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

  res.json({ bytes: base64Image });
});

/**
 * Start Server
 */
// Export the Express app for Vercel
module.exports = app;

/**
 * 
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
 * 
 */
