let userLatitude = null;
let userLongitude = null;

// Get user's current location
navigator.geolocation.getCurrentPosition(
(position) => {
userLatitude = position.coords.latitude;
userLongitude = position.coords.longitude;

```
    console.log("Latitude:", userLatitude);
    console.log("Longitude:", userLongitude);

    document.getElementById("location").innerHTML =
        "Latitude: " + userLatitude +
        "<br><br>Longitude: " + userLongitude;
},
(error) => {
    alert("Location access denied. Please allow location access.");
}
```

);

// Upload function
async function uploadData() {

```
const imageFile =
    document.getElementById("imageFile").files[0];

if (!imageFile) {
    alert("Please select a sky image.");
    return;
}

const formData = new FormData();

formData.append("latitude", userLatitude);
formData.append("longitude", userLongitude);
formData.append("image", imageFile);

try {

    const response = await fetch(
        "http://localhost:5000/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    alert(
        "Sky Data Saved Successfully\n\n" +
        "Pollution Score: " +
        data.pollutionScore
    );

} catch (error) {

    console.error(error);

    alert("Upload failed.");
}
```

}

// Upload button click
document.getElementById("uploadBtn")
.addEventListener("click", uploadData);
