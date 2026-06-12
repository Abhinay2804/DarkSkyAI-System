const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");
const path = require("path");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "darksky",
    password: "chinnu2804",
    port: 5432,
});

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Home Route
app.get("/", (req, res) => {
    res.send("DarkSky AI Backend Running");
});

// Upload Route
app.post("/upload", upload.single("image"), async (req, res) => {

    try {

        const latitude = req.body.latitude;
        const longitude = req.body.longitude;

        const imagePath = req.file.filename;

        const fullImagePath =
            path.join(__dirname, "uploads", imagePath);

        exec(
            `python ../ai/brightness_analysis.py "${fullImagePath}"`,
            async (error, stdout, stderr) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message: "Analysis Error"
                    });
                }

                const pollutionScore =
                    parseFloat(stdout.trim());

                await pool.query(
                    `INSERT INTO pollution_records
                    (latitude, longitude, image_path, pollution_score)
                    VALUES ($1,$2,$3,$4)`,
                    [
                        latitude,
                        longitude,
                        imagePath,
                        pollutionScore
                    ]
                );

                res.json({
                    message: "Sky Data Saved Successfully",
                    pollutionScore
                });
            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Database Error"
        });
    }
});

// Records API
app.get("/records", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM pollution_records ORDER BY id DESC"
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error Fetching Records"
        });
    }
});

// Start Server

app.listen(5000, "0.0.0.0", () => {

console.log(
    "Server running on port 5000"
);

});