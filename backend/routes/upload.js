const express = require("express");
const multer = require("multer");
const { pinata } = require("../lib/pinata.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.fields([{ name: "file" }, { name: "thumbnail" }]), async (req, res) => {
  try {
    const file = req.files?.file?.[0];
    const image = req.files?.thumbnail?.[0];

    if (!file) return res.status(400).json({ error: "No document file provided" });

    const results = {};

    // Upload main file - attempt to pass buffer or stream to Pinata SDK
    const uploadedFile = await pinata.upload.public.file(file.buffer || file.stream || file.path, {
      filename: file.originalname,
    });
    const fileUrl = await pinata.gateways.public.convert(uploadedFile.cid);
    results.fileUrl = fileUrl;

    if (image) {
      const fileThumb = await pinata.upload.public.file(image.buffer || image.stream || image.path, {
        filename: image.originalname,
      });
      const imgUrl = await pinata.gateways.public.convert(fileThumb.cid);
      results.imgUrl = imgUrl;
    }

    const otherFields = {};
    // multer doesn't populate other form entries in the same way; read from req.body
    for (const key of Object.keys(req.body || {})) {
      otherFields[key] = req.body[key];
    }

    const metadataJSON = {
      ...otherFields,
      file: results.fileUrl,
      image: results.imgUrl || null,
      timestamp: new Date().toISOString(),
    };

    const uploadedJson = await pinata.upload.public.json(metadataJSON);
    const jsonUrl = await pinata.gateways.public.convert(uploadedJson.cid);
    results.metadataUrl = jsonUrl;

    return res.json({ success: true, fileUrl: results.fileUrl, image: results.imgUrl || "", metadata: results.metadataUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
});

module.exports = router;
