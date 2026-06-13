alert("Script Loaded");

let userLatitude = null;
let userLongitude = null;

navigator.geolocation.getCurrentPosition(
    function(position) {

        alert("Location Access Granted");

        userLatitude = position.coords.latitude;
        userLongitude = position.coords.longitude;

        document.getElementById("location").innerHTML =
            "Latitude: " + userLatitude +
            "<br><br>Longitude: " + userLongitude;
    },
    function(error) {

        alert("Location Access Denied");
        console.log(error);
    }
);

document.getElementById("uploadBtn")
.addEventListener("click", async function() {

    const imageFile =
        document.getElementById("imageFile").files[0];

    if (!imageFile) {
        alert("Please select an image");
        return;
    }

    const formData = new FormData();

    formData.append("latitude", userLatitude);
    formData.append("longitude", userLongitude);
    formData.append("image", imageFile);

    try {

        const response = await fetch(
            "https://darkskyai-system.onrender.com/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        alert(
            "Upload Successful\n\n" +
            "Latitude: " + userLatitude +
            "\nLongitude: " + userLongitude
        );

        console.log(data);

    } catch (error) {

        console.error(error);
        alert("Upload Failed");
    }
});