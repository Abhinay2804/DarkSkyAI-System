alert("Script Loaded");

navigator.geolocation.getCurrentPosition(
    function(position) {

        alert("Location Access Granted");

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        document.getElementById("location").innerHTML =
            "Latitude: " + latitude +
            "<br><br>Longitude: " + longitude;
    },
    function(error) {

        alert("Location Access Denied");
        console.log(error);
    }
);

document.getElementById("uploadBtn")
.addEventListener("click", function() {

    alert("Upload Button Clicked");

});