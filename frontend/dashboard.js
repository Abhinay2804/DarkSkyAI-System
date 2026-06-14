const map = L.map("map").setView(
    [18.0157, 79.5635],
    13
);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }
).addTo(map);

async function loadData() {

    try {

        const response = await fetch(
            "https://darkskyai-system.onrender.com/uploads"
        );

        const data = await response.json();

        console.log("Data:", data);

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

            const lat =
                Number(item.latitude);

            const lng =
                Number(item.longitude);

            const score =
                Number(item.pollution_score);

            heatData.push([
                lat,
                lng,
                score / 100
            ]);

            L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`
                    <b>Pollution Score:</b> ${score}<br>
                    <b>Latitude:</b> ${lat}<br>
                    <b>Longitude:</b> ${lng}
                `);

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

            const row =
                table.insertRow();

            row.insertCell(0).innerHTML =
                item.image_url;

            row.insertCell(1).innerHTML =
                lat;

            row.insertCell(2).innerHTML =
                lng;

            row.insertCell(3).innerHTML =
                new Date(
                    item.upload_time
                ).toLocaleString();

            row.insertCell(4).innerHTML =
                score;
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

        L.heatLayer(
            heatData,
            {
                radius: 10,
                blur: 8,
                minOpacity: 0.05,
                maxZoom: 18,

                gradient: {
                    0.2: "blue",
                    0.4: "lime",
                    0.6: "yellow",
                    0.8: "orange",
                    1.0: "red"
                }
            }
        ).addTo(map);

        const bounds =
            L.latLngBounds(
                heatData.map(
                    point => [
                        point[0],
                        point[1]
                    ]
                )
            );

        map.fitBounds(
            bounds,
            {
                padding: [50, 50]
            }
        );

        map.setZoom(14);

        setTimeout(() => {
            map.invalidateSize();
        }, 500);

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