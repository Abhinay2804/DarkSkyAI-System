async function loadData() {

    const response = await fetch(
        "https://darkskyai-system.onrender.com/uploads"
    );

    const data = await response.json();

    const table = document.getElementById("dataTable");

    data.forEach(item => {

        const row = table.insertRow();

        row.insertCell(0).innerHTML = item.image_url;
        row.insertCell(1).innerHTML = item.latitude;
        row.insertCell(2).innerHTML = item.longitude;
        row.insertCell(3).innerHTML = new Date(item.upload_time).toLocaleString();
        row.insertCell(4).innerHTML = item.pollution_score;
    });
}

loadData();