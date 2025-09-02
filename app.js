const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Simple data store
let items = [
  { id: 1, name: "Item 1", description: "Test item 1" },
  { id: 2, name: "Item 2", description: "Test item 2" },
];

// Essential routes
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

app.listen(port, () => {
  console.log(`🚀 API running on http://localhost:${port}`);
});

module.exports = app;

// Add B2 upload to app.js
const B2 = require("backblaze-b2");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const b2 = new B2({
  applicationKeyId: "0032f3db1cb3e170000000005",
  applicationKey: "K003Jg0zMa7tbRR2dfpxJNr9+kMzVW0",
});

// File upload endpoint
app.post("/api/items/:id/upload", upload.single("file"), async (req, res) => {
  try {
    if (!b2) {
      return res.status(500).json({ error: "B2 not configured" });
    }

    // 1. Authorize B2
    await b2.authorize();

    // 2. Get bucket ID (you should replace "LarvalStorage" with your actual bucket name)
    const bucketName = "LarvalStorage";
    const buckets = await b2.listBuckets();
    const bucket = buckets.data.buckets.find(
      (b) => b.bucketName === bucketName
    );

    if (!bucket) {
      return res.status(404).json({ error: "Bucket not found" });
    }

    // 3. Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: bucket.bucketId,
    });

    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const authToken = uploadUrlResponse.data.authorizationToken;

    // 4. Upload file
    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authToken,
      fileName: req.file.originalname,
      data: req.file.buffer,
    });

    console.log(" File uploaded:", uploadResponse.data.fileName);

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
