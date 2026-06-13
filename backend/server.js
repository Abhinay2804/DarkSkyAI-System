const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage
});

app.post(
    "/upload",
    upload.single("image"),
    (req, res) => {

        const latitude = req.body.latitude;
        const longitude = req.body.longitude;

        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        console.log(
            "Image Name:",
            req.file.originalname
        );

        res.json({
            message: "Sky Data Uploaded Successfully",
            pollutionScore: 25
        });
    }
);

app.listen(5000, () => {

    console.log(
        "Server Running On Port 5000"
    );
});