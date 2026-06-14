const map = L.map("map").setView(
    [18.0157, 79.5635],
    8
);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors",
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

        let totalUploads =
            data.length;

        let totalPollution = 0;

        let highestPollution = 0;

        let chartLabels = [];

        let chartScores = [];

        let locations = [];

        data.forEach(item => {

            const lat =
                Number(item.latitude);

            const lng =
                Number(item.longitude);

            const score =
                Number(item.pollution_score);

            if (
                isNaN(lat) ||
                isNaN(lng) ||
                isNaN(score)
            ) {
                return;
            }

            locations.push([
                lat,
                lng
            ]);

            L.marker([
                lat,
                lng
            ])
            .addTo(map)
            .bindPopup(
                `
                <b>Pollution Score:</b> ${score}<br>
                <b>Latitude:</b> ${lat}<br>
                <b>Longitude:</b> ${lng}<br>
                <a href="${item.image_url}" target="_blank">
                    View Image
                </a>
                `
            );

            totalPollution += score;

            if (
                score >
                highestPollution
            ) {
                highestPollution =
                    score;
            }

            chartLabels.push(
                new Date(
                    item.upload_time
                ).toLocaleDateString()
            );

            chartScores.push(
                score
            );

            const row =
                table.insertRow();

            row.insertCell(0).innerHTML =
                item.image_url
                ? `<a href="${item.image_url}" target="_blank">View</a>`
                : "No Image";

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
            : "0";

        document.getElementById(
            "highestPollution"
        ).innerText =
            highestPollution;

        if (
            locations.length > 0
        ) {

            const bounds =
                L.latLngBounds(
                    locations
                );

            map.fitBounds(
                bounds,
                {
                    padding:
                    [50, 50]
                }
            );
        }

        const ctx =
            document.getElementById(
                "pollutionChart"
            );

        new Chart(ctx, {

            type: "line",

            data: {

                labels:
                    chartLabels,

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

                responsive: true,

                maintainAspectRatio: false

            }

        });

    }
    catch(error) {

        console.error(
            "Dashboard Error:",
            error
        );
    }
}

loadData();