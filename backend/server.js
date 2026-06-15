const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(cors());

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: {
rejectUnauthorized: false
}
});

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            path.join(
                __dirname,
                "uploads"
            )
        );
    },

    filename: function (req, file, cb) {

        cb(
            null,
            Date.now() +
            "-" +
            file.originalname
        );
    }

});

const upload = multer({
    storage: storage
});

app.post(
"/upload",
upload.single("image"),
async (req, res) => {
    console.log("FILE DATA:", req.file);


    try {

        const latitude = req.body.latitude;
        const longitude = req.body.longitude;

        const imageName =
    req.file.filename;

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
        await pool.query(
            `
            SELECT *
            FROM sky_uploads
            ORDER BY upload_time DESC
            `
        );

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

const PORT =
process.env.PORT || 10000;

app.listen(PORT, () => {


console.log(
    `Server Running On Port ${PORT}`
);


});
