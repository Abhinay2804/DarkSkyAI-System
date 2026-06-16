const map = L.map("map").setView(
    [18.0157, 79.5635],
    10
);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19
    }
).addTo(map);

window.addEventListener("load", () => {
    setTimeout(() => {
        map.invalidateSize(true);
    }, 1000);
});

async function loadData() {

    try {

        const response = await fetch(
            "https://darkskyai-system.onrender.com/uploads"
        );

        const data = await response.json();

        console.log("Data:", data);

        const table =
            document.getElementById("dataTable");

        let totalUploads = data.length;
        let totalPollution = 0;
        let highestPollution = 0;

        let chartLabels = [];
        let chartScores = [];

        let markerPoints = [];

        data.forEach(item => {

            const lat = Number(item.latitude);
            const lng = Number(item.longitude);
            const score = Number(item.pollution_score);

            if (
                isNaN(lat) ||
                isNaN(lng) ||
                isNaN(score)
            ) {
                return;
            }

            let status;

            if (score <= 15) {
                status = "Good";
            }
            else if (score <= 35) {
                status = "Moderate";
            }
            else {
                status = "High";
            }

            markerPoints.push([lat, lng]);

            L.marker([lat, lng])
                .addTo(map)
                .bindPopup(
                    `
                    <b>Pollution Score:</b> ${score}<br>
                    <b>Status:</b> ${status}<br>
                    <b>AQI:</b> ${item.aqi ?? "N/A"}<br>
                    <b>PM2.5:</b> ${item.pm25 ?? "N/A"}<br>
                    <b>Latitude:</b> ${lat}<br>
                    <b>Longitude:</b> ${lng}
                    `
                );

            totalPollution += score;

            if (score > highestPollution) {
                highestPollution = score;
            }

            chartLabels.push(
                new Date(
                    item.upload_time
                ).toLocaleDateString()
            );

            chartScores.push(score);

            const row = table.insertRow();

row.insertCell(0).innerHTML =
    lat;

row.insertCell(1).innerHTML =
    lng;

row.insertCell(2).innerHTML =
    new Date(
        item.upload_time
    ).toLocaleString();

row.insertCell(3).innerHTML =
    score;

row.insertCell(4).innerHTML =
    item.aqi ?? "N/A";

row.insertCell(5).innerHTML =
    item.pm25 ?? "N/A";

row.insertCell(6).innerHTML =
    status;

    });

        document.getElementById(
            "totalUploads"
        ).innerText = totalUploads;

        document.getElementById(
            "avgPollution"
        ).innerText =
            totalUploads > 0
                ? (
                    totalPollution /
                    totalUploads
                ).toFixed(2)
                : "0";

        document.getElementById(
            "highestPollution"
        ).innerText =
            highestPollution;

            const predictionResponse =
    await fetch(
        "https://darkskyai-system.onrender.com/prediction"
    );

const predictionData =
    await predictionResponse.json();

    document.getElementById(
    "prediction"
).innerText =
    predictionData.tomorrowPrediction;

document.getElementById(
    "riskLevel"
).innerText =
    predictionData.riskLevel;

    document.getElementById(
    "recommendation"
).innerText =
    predictionData.recommendation;

const forecastLabels =
    (predictionData.forecast || []).map(
        item => item.day
    );

const forecastScores =
    (predictionData.forecast || []).map(
        item => item.score
    );

const forecastCtx =
    document.getElementById(
        "forecastChart"
    );

if (forecastCtx) {

    new Chart(forecastCtx, {

        type: "line",

        data: {

            labels: forecastLabels,

            datasets: [
                {
                    label: "Predicted Pollution",

                    data: forecastScores,

                    borderWidth: 3,

                    tension: 0.4
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false
        }

    });

}

        if (markerPoints.length > 0) {

            const bounds =
                L.latLngBounds(
                    markerPoints
                );

            map.fitBounds(
                bounds,
                {
                    padding: [50, 50]
                }
            );
        }

        const ctx =
            document.getElementById(
                "pollutionChart"
            );

        if (ctx) {

            new Chart(ctx, {
                type: "line",
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: "Pollution Score",
                            data: chartScores,
                            borderWidth: 3,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

        }

        const locationResponse =
    await fetch(
        "https://darkskyai-system.onrender.com/locations"
    );

const locations =
    await locationResponse.json();

const locationTable =
    document.getElementById(
        "locationTable"
    );

locations.forEach(location => {

    const row =
        locationTable.insertRow();

    row.insertCell(0).innerHTML =
        location.latitude;

    row.insertCell(1).innerHTML =
        location.longitude;

    row.insertCell(2).innerHTML =
        Number(
            location.avg_score
        ).toFixed(2);

});

        setTimeout(() => {
            map.invalidateSize(true);
        }, 2000);

    }
    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }

}

loadData();

function downloadReport() {

    const report = `

DarkSky AI Report

Total Uploads:
${document.getElementById("totalUploads").innerText}

Average Pollution:
${document.getElementById("avgPollution").innerText}

Highest Pollution:
${document.getElementById("highestPollution").innerText}

Tomorrow Prediction:
${document.getElementById("prediction").innerText}

Risk Level:
${document.getElementById("riskLevel").innerText}

Recommendation:
${document.getElementById("recommendation").innerText}

`;

    const blob =
        new Blob(
            [report],
            { type: "text/plain" }
        );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "DarkSkyAI_Report.txt";

    link.click();

}