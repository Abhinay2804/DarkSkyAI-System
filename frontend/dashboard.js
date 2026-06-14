
async function loadData() {

    const response = await fetch(
        "https://darkskyai-system.onrender.com/uploads"
    );

    const data = await response.json();

    const table =
        document.getElementById("dataTable");

    let totalPollution = 0;

    data.forEach(item => {

        totalPollution += item.pollution_score;

        const row =
            table.insertRow();

        row.insertCell(0).innerHTML =
            item.image_url;

        row.insertCell(1).innerHTML =
            item.latitude;

        row.insertCell(2).innerHTML =
            item.longitude;

        row.insertCell(3).innerHTML =
            new Date(
                item.upload_time
            ).toLocaleString();

        row.insertCell(4).innerHTML =
            item.pollution_score;
    });

    document.getElementById(
        "totalUploads"
    ).innerHTML = data.length;

    const average =
        data.length > 0
        ? (totalPollution / data.length)
        : 0;

    document.getElementById(
        "avgPollution"
    ).innerHTML =
        average.toFixed(2);

    document.getElementById(
        "todayUploads"
    ).innerHTML =
        data.length;

    const map =
        L.map("map")
        .setView(
            [18.0157,79.5635],
            7
        );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(map);

    data.forEach(item => {

        L.marker([
            item.latitude,
            item.longitude
        ])
        .addTo(map)
        .bindPopup(
            "Score: " +
            item.pollution_score
        );
    });

    const ctx =
        document.getElementById(
            "pollutionChart"
        );

    new Chart(ctx, {

        type: "bar",

        data: {

            labels:
                data.map(
                    x => x.image_url
                ),

            datasets: [

                {
                    label:
                        "Pollution Score",

                    data:
                        data.map(
                            x =>
                            x.pollution_score
                        )
                }
            ]
        }
    });
}

loadData();

