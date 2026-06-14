const map = L.map("map").setView(
[18.0157, 79.5635],
8
);

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
attribution: "© OpenStreetMap"
}
).addTo(map);

async function loadData() {


try {

    const response = await fetch(
        "https://darkskyai-system.onrender.com/uploads"
    );

    const data = await response.json();

    const table =
        document.getElementById(
            "dataTable"
        );

    let heatData = [];

    let totalUploads = data.length;
    let totalPollution = 0;
    let highestPollution = 0;

    let chartLabels = [];
    let chartScores = [];

    data.forEach(item => {

        heatData.push([
Number(item.latitude),
Number(item.longitude),
Math.max(
Number(item.pollution_score) / 50,
0.5
)
]);


        totalPollution +=
            Number(item.pollution_score);

        if (
            Number(item.pollution_score) >
            highestPollution
        ) {
            highestPollution =
                Number(item.pollution_score);
        }

        chartLabels.push(
            new Date(
                item.upload_time
            ).toLocaleDateString()
        );

        chartScores.push(
            Number(item.pollution_score)
        );

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
    ).innerText =
        totalUploads;

    document.getElementById(
        "avgPollution"
    ).innerText =
        totalUploads > 0
        ? (
            totalPollution /
            totalUploads
        ).toFixed(2)
        : 0;

    document.getElementById(
        "highestPollution"
    ).innerText =
        highestPollution;

    if (heatData.length > 0) {

        L.heatLayer(
heatData,
{
radius: 120,
blur: 70,
maxZoom: 20,
minOpacity: 0.9,


    gradient: {
        0.1: "blue",
        0.3: "cyan",
        0.5: "lime",
        0.7: "yellow",
        0.9: "orange",
        1.0: "red"
    }
}


).addTo(map);


        const bounds =
            heatData.map(
                point => [
                    point[0],
                    point[1]
                ]
            );

        map.fitBounds(bounds);
    }

    const ctx =
        document.getElementById(
            "pollutionChart"
        );

    new Chart(ctx, {
        type: "line",
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label:
                        "Pollution Score",
                    data:
                        chartScores,
                    borderWidth: 3,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true
        }
    });

} catch(error) {

    console.error(
        "Dashboard Error:",
        error
    );
}


}

loadData();
