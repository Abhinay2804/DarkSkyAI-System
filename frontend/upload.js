const uploadBtn = document.getElementById("uploadBtn");
const status = document.getElementById("status");

const imageInput = document.getElementById("image");

const manualLocation = document.getElementById("manualLocation");

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");

const radios = document.getElementsByName("locationType");


// Show / Hide Manual Location

radios.forEach(radio => {

    radio.addEventListener("change", () => {

        if (radio.value === "manual" && radio.checked) {

            manualLocation.style.display = "block";

        } else if (radio.value === "auto" && radio.checked) {

            manualLocation.style.display = "none";

        }

    });

});


uploadBtn.addEventListener("click", () => {

    const image = imageInput.files[0];

    if (!image) {

        alert("Please select an image.");

        return;

    }

    const selected =
        document.querySelector(
            "input[name='locationType']:checked"
        ).value;


    if (selected === "auto") {

        if (!navigator.geolocation) {

            alert("Geolocation not supported.");

            return;

        }

        status.innerHTML = "📍 Getting Current Location...";

        navigator.geolocation.getCurrentPosition(

            (position) => {

                uploadImage(

                    image,

                    position.coords.latitude,

                    position.coords.longitude

                );

            },

            () => {

                alert("Please allow location access.");

            }

        );

    }

    else {

        const latitude =
            latitudeInput.value;

        const longitude =
            longitudeInput.value;

        if (latitude === "" || longitude === "") {

            alert("Please enter Latitude & Longitude.");

            return;

        }

        uploadImage(

            image,

            latitude,

            longitude

        );

    }

});


async function uploadImage(image, latitude, longitude) {

    const formData = new FormData();

    formData.append("image", image);

    formData.append("latitude", latitude);

    formData.append("longitude", longitude);

    status.innerHTML = "⬆ Uploading Image...";

    try {

        const response = await fetch(
    "https://darkskyai-system-1.onrender.com/upload",
    {
        method: "POST",
        body: formData
    }
);

        const result = await response.json();

        if (result.success) {

            status.innerHTML = "✅ Upload Successful";

            alert(

`Upload Successful!

AQI : ${result.data.aqi}

PM2.5 : ${result.data.pm25}

Pollution Score : ${result.data.pollutionScore}`

            );

        }

        else {

            status.innerHTML = "❌ Upload Failed";

            alert(result.message);

        }

    }

    catch (error) {

        console.error(error);

        status.innerHTML = "❌ Server Error";

    }

}