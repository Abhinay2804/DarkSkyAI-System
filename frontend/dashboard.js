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

```
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
        parseFloat(item.latitude),
        parseFloat(item.longitude),
        item.pollution_score / 100
    ]);

    totalPollution += item.pollution_score;

    if (
        item.pollution_score >
        highestPollution
    ) {
        highestPollution =
            item.pollution_score;
    }

    chartLabels.push(
        new Date(
            item.upload_time
        ).toLocaleDateString()
    );

    chartScores.push(
        item.pollution_score
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
    (
        totalPollution /
        totalUploads
    ).toFixed(2);

document.getElementById(
    "highestPollution"
).innerText =
    highestPollution;

const heatLayer =
    L.heatLayer(
        heatData,
        {
            radius: 40,
            blur: 25,
            maxZoom: 18,
            minOpacity: 0.5
        }
    ).addTo(map);

const bounds =
    heatData.map(
        point => [
            point[0],
            point[1]
        ]
    );

if(bounds.length > 0){
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
                fill: false
            }
        ]
    },
    options: {
        responsive: true
    }
});
```

}

loadData();
