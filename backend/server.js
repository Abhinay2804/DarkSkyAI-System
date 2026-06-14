const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");
const axios = require("axios");
const FormData = require("form-data");

const app = express();

app.use(cors());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage
});

app.post(
    "/upload",
    upload.single("image"),
    async (req, res) => {

        try {

            const latitude = req.body.latitude;
            const longitude = req.body.longitude;

            const imageName =
                req.file.originalname;

            const formData = new FormData();

            formData.append(
                "image",
                req.file.buffer,
                req.file.originalname
            );

            const aiResponse = await axios.post(
                "https://darkskyai-ai.onrender.com/predict",
                formData,
                {
                    headers: formData.getHeaders()
                }
            );

            const pollutionScore =
                aiResponse.data.pollutionScore;

            await pool.query(
                `
                INSERT INTO sky_uploads
                (
                    image_url,
                    latitude,
                    longitude,
                    pollution_score
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
                `,
                [
                    imageName,
                    latitude,
                    longitude,
                    pollutionScore
                ]
            );

            res.json({
                message:
                    "Sky Data Uploaded Successfully",
                pollutionScore
            });

        } catch (error) {

            console.error("FULL ERROR:", error);

            if (error.response) {
                console.error(
                    "AI RESPONSE:",
                    error.response.data
                );
            }

            res.status(500).json({
                error: error.message
            });
        }
    }
);

app.get("/uploads", async (req, res) => {

    try {

        const result =
            await pool.query(
                `
                SELECT *
                FROM sky_uploads
                ORDER BY upload_time DESC
                `
            );

        res.json(result.rows);

    } catch (error) {

        console.error("FULL ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server Running On Port ${PORT}`
    );
});