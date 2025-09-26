const express = require("express");
require("dotenv").config();
const B2 = require("backblaze-b2");
const multer = require("multer");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Simple data store
let items = [
  { id: 1, name: "Item 1", description: "Test item 1" },
  { id: 2, name: "Item 2", description: "Test item 2" },
];

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.get("/api/items", (req, res) => res.json(items));

app.get("/api/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

app.post("/api/items", (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
    description: req.body.description,
    createdAt: new Date(),
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// B2 setup
const upload = multer({ storage: multer.memoryStorage() });
const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID || "your-key-id",
  applicationKey: process.env.B2_KEY || "your-key",
});

// File upload endpoint
app.post("/api/items/:id/upload", upload.single("file"), async (req, res) => {
  try {
    await b2.authorize();

    const bucketName = "LarvalStorage";
    const buckets = await b2.listBuckets();
    const bucket = buckets.data.buckets.find(
      (b) => b.bucketName === bucketName
    );

    if (!bucket) {
      return res.status(404).json({ error: "Bucket not found" });
    }

    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: bucket.bucketId,
    });
    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const authToken = uploadUrlResponse.data.authorizationToken;

    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authToken,
      fileName: req.file.originalname,
      data: req.file.buffer,
    });

    console.log("File uploaded:", uploadResponse.data.fileName);

    res.json({
      message: "File uploaded successfully",
      fileId: uploadResponse.data.fileId,
      fileName: uploadResponse.data.fileName,
    });
  } catch (error) {
    console.error("B2 Error:", error.message);
    res
      .status(500)
      .json({ error: "B2 connection failed", details: error.message });
  }
});

// B2 status endpoint
app.get("/api/storage/stats", async (req, res) => {
  try {
    await b2.authorize();
    res.json({ provider: "Backblaze B2", status: "connected" });
  } catch (error) {
    res.status(500).json({ provider: "Backblaze B2", status: "disconnected" });
  }
});

console.log("CI/CD test");

// 👇 Only start the server if app.js is run directly (not when required by Jest)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 API running on http://localhost:${port}`);
  });
}

module.exports = app;
