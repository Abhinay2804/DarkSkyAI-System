const { CloudinaryStorage } =
    require("multer-storage-cloudinary");

const cloudinary =
    require("cloudinary").v2;
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");
const axios = require("axios");


const app = express();

app.use(cors());



const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: {
rejectUnauthorized: false
}
});

cloudinary.config({

    cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,

    api_key:
        process.env.CLOUDINARY_API_KEY,

    api_secret:
        process.env.CLOUDINARY_API_SECRET
});

const storage =
    new CloudinaryStorage({

        cloudinary: cloudinary,

        params: {

            folder:
                "darkskyai",

            allowed_formats: [
                "jpg",
                "jpeg",
                "png"
            ]
        }
    });

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
    req.file.path;
    console.log(
    "FILE PATH:",
    req.file?.path
);
        const aqiResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}`
        );

        const aqi =
            aqiResponse.data.list[0].main.aqi;

        const pm25 =
            aqiResponse.data.list[0].components.pm2_5;

        const pollutionScore =
            Math.round(pm25);

        await pool.query(
            `
            INSERT INTO sky_uploads
            (
                image_url,
                latitude,
                longitude,
                pollution_score,
                aqi,
                pm25
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )
            `,
            [
                imageName,
                latitude,
                longitude,
                pollutionScore,
                aqi,
                pm25
            ]
        );

        res.json({
            message:
                "Sky Data Uploaded Successfully",
            pollutionScore,
            aqi,
            pm25
        });

    } catch (error) {

        console.error(
            "FULL ERROR:",
            error
        );

        res.status(500).json({
            error: error.message
        });
    }
}


);

app.get("/uploads", async (req, res) => {

    try {

        const result =
            await pool.query(`
                SELECT *
                FROM sky_uploads
                ORDER BY upload_time DESC
            `);

        res.json(result.rows);

    } catch (error) {

        console.error(
            "FULL ERROR:",
            error
        );

        res.status(500).json({
            error: error.message
        });

    }

});

app.get("/prediction", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT pollution_score
            FROM sky_uploads
            ORDER BY upload_time DESC
            LIMIT 7
        `);

        const scores =
    result.rows.map(
        row => Number(row.pollution_score)
    );

if (scores.length === 0) {

    return res.json({
        tomorrowPrediction: 0,
        riskLevel: "No Data"
    });

}

const average =
    scores.reduce(
        (a, b) => a + b,
        0
    ) / scores.length;
        const tomorrowPrediction =
            Math.round(average);

        let riskLevel;

        if (tomorrowPrediction <= 15) {
            riskLevel = "Low";
        }
        else if (tomorrowPrediction <= 35) {
            riskLevel = "Moderate";
        }
        else {
            riskLevel = "High";
        }

        res.json({
            tomorrowPrediction,
            riskLevel
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

const PORT =
process.env.PORT || 10000;

app.listen(PORT, () => {

    console.log(
        `Server Running On Port ${PORT}`
    );

});
