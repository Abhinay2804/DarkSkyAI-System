async function uploadData() {

    navigator.geolocation.getCurrentPosition(
        async function(position){

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            document.getElementById("location").innerHTML =
                "Latitude: " + latitude +
                "<br><br>Longitude: " + longitude;

            const imageFile =
                document.getElementById("imageFile").files[0];

            const formData = new FormData();

            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("image", imageFile);

            const response = await fetch(
                "http://localhost:5000/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            alert(
                data.message +
                "\nPollution Score: " +
                data.pollutionScore
            );
        }
    );
}