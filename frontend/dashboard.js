const map = L.map("map").setView(
    [18.0157, 79.5635],
    8
);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
        "© OpenStreetMap"
    }
).addTo(map);

async function loadData() {

    const response = await fetch(
        "https://darkskyai-system.onrender.com/uploads"
    );

    const data = await response.json();

    const table =
        document.getElementById(
            "dataTable"
        );

    data.forEach(item => {

        let color = "green";

        if (
            item.pollution_score > 60
        ) {
            color = "red";
        }
        else if (
            item.pollution_score > 30
        ) {
            color = "orange";
        }

        L.circleMarker(
            [
                item.latitude,
                item.longitude
            ],
            {
                radius: 10,
                color: color,
                fillColor: color,
                fillOpacity: 0.8
            }
        )
        .addTo(map)
        .bindPopup(
            `
            <b>Pollution Score:</b>
            ${item.pollution_score}
            <br>
            <b>Location:</b>
            ${item.latitude},
            ${item.longitude}
            `
        );

        const row =
            table.insertRow();

        row.insertCell(0)
            .innerHTML =
            item.image_url;

        row.insertCell(1)
            .innerHTML =
            item.latitude;

        row.insertCell(2)
            .innerHTML =
            item.longitude;

        row.insertCell(3)
            .innerHTML =
            new Date(
                item.upload_time
            ).toLocaleString();

        row.insertCell(4)
            .innerHTML =
            item.pollution_score;
    });
}

loadData();