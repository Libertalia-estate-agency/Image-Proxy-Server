const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const sharp = require("sharp");
const compression = require("compression");


const app = express();
const PORT = process.env.PORT || 5000;

// Increase payload limit to handle large images
app.use(express.json({ limit: "100mb" }));
app.use(cors({ origin :'true' }));
app.use(bodyParser.json());

app.use(compression());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");  // Allow all origins (you can restrict this to specific domains for security)
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

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
    
    const response = await axios.get(imageUrl, { 
      responseType: "arraybuffer", 
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Access-Control-Allow-Origin': '*'
      },
    });
    
    //const base64Image = Buffer.from(response.data, "binary").toString("base64");
    
    const contentType = response.headers["content-type"];

    let imageBuffer = Buffer.from(response.data, "binary");
    // Auto-rotate and ensure landscape orientation
        const processedImageBuffer = await sharp(imageBuffer)
            .rotate() // Auto-rotate based on EXIF data
            .resize({ width: 800, height: 600, fit: "cover" }) // Ensure landscape
            .toBuffer();

  const base64Image = processedImageBuffer.toString("base64");


    return `${base64Image}`;
  } catch (error) {
    console.error("Error converting image:", error.message); // Only log the error message
    return null;
  }
}

async function pictureToBase64(imageUrl) {
  try {
    
    const response = await axios.get(imageUrl, { 
      responseType: "arraybuffer",
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Access-Control-Allow-Origin': '*'
      } 
    });
    
    //const base64Image = Buffer.from(response.data, "binary").toString("base64");
    
    const contentType = response.headers["content-type"];
    const base64Image = Buffer.from(response.data, "binary").toString("base64");

    return `${base64Image}`;
  } catch (error) {
    console.error("Error converting image:", error.message); // Only log the error message
    return null;
  }
}


/**
 * 
 * API Route: Convert Image URL to Base64
 */
app.post("/convert", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

  const base64Image = await pictureToBase64(imageUrl);
  if (!base64Image) return res.status(500).json({ error: "Failed to convert image" });

  res.send(base64Image);
  //res.json({ base64Image });
});

/**
 * 
 * API Route: Convert Profile Picture to Base64
 */
app.post("/convertProfile", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

  const base64Image = await imageToBase64(imageUrl);
  if (!base64Image) return res.status(500).json({ error: "Failed to convert image" });

  res.json({ bytes: base64Image });
  //res.json({ base64Image });
});

/**
 * 
 * API Route: Convert Image URL to Base64
 */
app.post("/converter", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

  const base64Image = await pictureToBase64(imageUrl);
  if (!base64Image) return res.status(500).json({ error: "Failed to convert image" });

  res.json({ bytes: base64Image });
  //res.json({ base64Image });
});

app.post("/convertMultiple", async (req, res) => {
  const { imageUrls } = req.body; // Expecting an array of image URLs
  //console.log("IMAGE URLS ::: " + JSON.stringify(imageUrls));


  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({ error: "At least one image URL is required" });
  }

  try {
    // Convert each image URL to Base64
    const base64Images = await Promise.all(
      imageUrls.map(async (url) => {
        try {
          const base64 = await pictureToBase64(url);
          //console.log("url :::: " + JSON.stringify(url));
          //console.log("base64 :::: " + JSON.stringify(base64));

          return base64 || null;
        } catch (error) {
          console.error(`Failed to convert image: ${url}`, error.message);
          return { url, error: "Failed to convert image" };
        }
      })
    );
      
    /**
     * 
     * // Filter out null values and return a plain object without an array
    const result = base64Images.filter(Boolean).reduce((acc, obj) => {
      return { ...acc, ...obj }; // Merging the objects into a single object without array
    }, {});

     * 
     */
    
    // Filter out null values 
    const result = base64Images.filter(Boolean);
    // Send as raw text (pure list of base64)
    res.send(result.join(","));  // Sends a newline-separated list of base64 strings

    //res.json(result);

    //res.json(result);
    // Convert array to string (remove brackets)
    //const formattedResponse = base64Images.filter(Boolean).map((obj) => JSON.stringify(obj)).join(",");
    //const formattedResponse = { photos: base64Images.filter(Boolean) };

    
    // Send response as raw JSON text

    // Return only valid base64 objects
    //res.json(base64Images.filter(Boolean));    //res.json({base64Images});
  } catch (error) {
    console.error("Error processing images:", error.message);
    res.status(500).json({ error: "Failed to convert images" });
  }
});


app.post("/converter-multiple", async (req, res) => {
  const { imageUrls } = req.body; // Expecting an array of image URLs

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({ error: "At least one image URL is required" });
  }

  try {
    // Convert each image URL to Base64
    const base64Images = await Promise.all(
      imageUrls.map(async (url) => {
        try {
          const base64 = await pictureToBase64(url);
          return { url, base64 }; // Return both the URL and converted Base64 string
        } catch (error) {
          console.error(`Failed to convert image: ${url}`, error.message);
          return { url, error: "Failed to convert image" };
        }
      })
    );

    res.json({ images: base64Images });
  } catch (error) {
    console.error("Error processing images:", error.message);
    res.status(500).json({ error: "Failed to convert images" });
  }
});

// Start the server locally
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running locally at http://localhost:${PORT}`);
  });
}

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
 */
