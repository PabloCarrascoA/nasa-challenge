let score = parseInt(localStorage.getItem("score")) || 0;
let learnedPlanets = JSON.parse(localStorage.getItem("learnedPlanets")) || [];

// Mostrar enlace SCORE en esquina superior izquierda

function updateScoreDisplay() {
    let scoreLink = document.getElementById("score-link");
    if (!scoreLink) {
        scoreLink = document.createElement("a");
        scoreLink.id = "score-link";
        scoreLink.href = "score.html";
        scoreLink.textContent = `SCORE: ${score}`;
        Object.assign(scoreLink.style, {
            position: "fixed",
            top: "15px",
            left: "20px",
            color: "#00ffea",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "18px",
            textDecoration: "none",
            background: "rgba(0, 0, 0, 0.4)",
            padding: "6px 12px",
            borderRadius: "10px",
            transition: "0.2s",
            zIndex: "9999"
        });
        scoreLink.addEventListener("mouseenter", () => {
            scoreLink.style.background = "rgba(7, 7, 7, 0.6)";
        });
        scoreLink.addEventListener("mouseleave", () => {
            scoreLink.style.background = "rgba(0, 0, 0, 0.4)";
        });
        document.body.appendChild(scoreLink);
    } else {
        scoreLink.textContent = `SCORE: ${score}`;
    }
}

// Guardar un exoplaneta descubierto

function addExoplanet(planet) {
    if (learnedPlanets.find(p => p.name === planet.name)) {
        return; // ya existe
    }

    learnedPlanets.push({
        name: planet.name,
        type: planet.exoplanet_value ? "Exoplaneta" : "Planeta del Sistema Solar",
        density: planet.density,
        atmosphere: planet.atmosphere,
        water_presence: planet.water_presence,
        distance: planet.distance,
        temperature: planet.temperature,
        discovery_date: new Date().toLocaleString()
    });
    score += 1;
    if (score > 20) {
        score = 0
    }

    localStorage.setItem("score", score);
    localStorage.setItem("learnedPlanets", JSON.stringify(learnedPlanets));

    updateScoreDisplay();
}

function renderScoreTable() {
    const scoreValue = document.getElementById("score-value");
    const table = document.getElementById("planet-table");
    const tbody = table ? table.querySelector("tbody") : null;
    const emptyMsg = document.getElementById("empty-msg");

    if (scoreValue) scoreValue.textContent = `SCORE TOTAL: ${score}`;

    if (learnedPlanets.length > 0 && table && tbody && emptyMsg) {
        table.style.display = "table";
        emptyMsg.style.display = "none";
        learnedPlanets.forEach(p => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${p.name}</td>
                <td>${p.type}</td>
                <td>${p.density}</td>
                <td>${p.atmosphere}</td>
                <td>${p.water_presence}</td>
                <td>${p.distance}</td>
                <td>${p.temperature}</td>
                <td>${p.discovery_date}</td>
            `;
            tbody.appendChild(row);
        });
    }
}