const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const analysisPrompt = require("./prompt.js");
const path = require("path");
const sharp = require("sharp");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure logs folder exists
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// Helper log
function writeLog(name, data) {
  fs.writeFileSync(`logs/${name}_${Date.now()}.json`, JSON.stringify(data, null, 2));
}

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });


// ------------------ Main Route ------------------
app.post("/analyze-handwriting", upload.single("photo"), async (req, res) => {
  const start = Date.now();

  try {
    if (!req.file)
      return res.status(400).json({ error: "No photo uploaded" });

    // Sizes
    const originalSize = fs.statSync(req.file.path).size;
    const compressedPath = "uploads/compressed_" + Date.now() + ".jpg";

    // Compress
    await sharp(req.file.path)
      .resize({ width: 1500, withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toFile(compressedPath);

    const compressedSize = fs.statSync(compressedPath).size;

    // Upload image
    const uploaded = await openai.files.create({
      file: fs.createReadStream(compressedPath),
      purpose: "vision",
    });

    const fileId = uploaded.id;

    // OpenAI Request
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: analysisPrompt },
            { type: "input_image", file_id: fileId },
          ],
        },
      ],
    });

    const outputText =
      response.output?.[0]?.content?.[0]?.text || "NO_OUTPUT";

    // ------------------ COST CALCULATION ------------------
    const usage = response.usage || {};

    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const imageTokens = usage.image_tokens || 0;

    const cost =
      (promptTokens / 1000) * 0.000150 +
      (completionTokens / 1000) * 0.000600 +
      (imageTokens / 1000) * 0.001650;

    // Cleanup
    fs.unlink(req.file.path, () => {});
    fs.unlink(compressedPath, () => {});

    const end = Date.now();
    const timeTaken = end - start;

    // ------------------ WRITE LOGS ------------------
    writeLog("openai_raw", outputText);

    writeLog("process_info", {
      original_size: originalSize,
      compressed_size: compressedSize,
      file_compression_ratio: (compressedSize / originalSize).toFixed(3),
      time_ms: timeTaken,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      image_tokens: imageTokens,
      cost_usd: cost.toFixed(6),
    });

    writeLog("full_response", response);

    // ------------------ SEND BACK TO APP ------------------
    res.json({
      ok: true,
      time_ms: timeTaken,
      original_size: originalSize,
      compressed_size: compressedSize,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        image: imageTokens,
      },
      cost_usd: cost.toFixed(6),
      report: outputText,
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    writeLog("error", err.toString());

    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

app.listen(3000, () => console.log("Backend running on port 3000"));
