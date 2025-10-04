
const starmapEl = document.getElementById('starmap');
const modalEl = document.getElementById('modal');
const planetNameEl = document.getElementById('planetName');
const planetDetailsEl = document.getElementById('planetDetails');
const closeModalBtn = document.getElementById('closeModal');

// Datos de ejemplo (simula una respuesta de IA)
const planetData = [
    {
        name: "Kepler-22b",
        exoplanet_value: true,
        density: "5.5 g/cm³",
        atmosphere: "Nitrogen-Oxygen",
        water_presence: "Yes",
        distance: "600 light years",
        temperature: "22°C (habitable zone)"
    },
    {
        name: "Mars",
        exoplanet_value: false,
        density: "3.9 g/cm³",
        atmosphere: "Carbon Dioxide",
        water_presence: "Ice caps",
        distance: "225 million km",
        temperature: "-63°C"
    },
    {
        name: "Proxima Centauri b",
        exoplanet_value: true,
        density: "5.4 g/cm³",
        atmosphere: "Unknown",
        water_presence: "Possible",
        distance: "4.24 light years",
        temperature: "-39°C to 30°C"
    },
    {
        name: "Venus",
        exoplanet_value: false,
        density: "5.2 g/cm³",
        atmosphere: "Carbon Dioxide, Sulfuric Acid",
        water_presence: "No",
        distance: "108 million km",
        temperature: "464°C"
    },
    {
        name: "TRAPPIST-1e",
        exoplanet_value: true,
        density: "5.0 g/cm³",
        atmosphere: "Potentially habitable",
        water_presence: "Likely",
        distance: "39 light years",
        temperature: "-22°C (habitable zone)"
    },
    {
        name: "Jupiter",
        exoplanet_value: false,
        density: "1.3 g/cm³",
        atmosphere: "Hydrogen, Helium",
        water_presence: "Traces in clouds",
        distance: "778 million km",
        temperature: "-108°C"
    },
    {
        name: "HD 209458 b",
        exoplanet_value: true,
        density: "0.4 g/cm³",
        atmosphere: "Hydrogen, Sodium",
        water_presence: "Water vapor detected",
        distance: "159 light years",
        temperature: "1000°C"
    },
    {
        name: "Earth",
        exoplanet_value: false,
        density: "5.5 g/cm³",
        atmosphere: "Nitrogen, Oxygen",
        water_presence: "Yes (71% surface)",
        distance: "0 km (home)",
        temperature: "15°C"
    },
    {
        name: "K2-18b",
        exoplanet_value: true,
        density: "3.3 g/cm³",
        atmosphere: "Hydrogen, Water vapor",
        water_presence: "Yes",
        distance: "124 light years",
        temperature: "-73°C to 47°C"
    },
    {
        name: "Saturn",
        exoplanet_value: false,
        density: "0.7 g/cm³",
        atmosphere: "Hydrogen, Helium",
        water_presence: "Ice in rings",
        distance: "1.4 billion km",
        temperature: "-139°C"
    },
    {
        name: "55 Cancri e",
        exoplanet_value: true,
        density: "5.9 g/cm³",
        atmosphere: "Unknown",
        water_presence: "Unlikely (too hot)",
        distance: "41 light years",
        temperature: "2000°C"
    },
    {
        name: "Neptune",
        exoplanet_value: false,
        density: "1.6 g/cm³",
        atmosphere: "Hydrogen, Helium, Methane",
        water_presence: "Ice/water mantle",
        distance: "4.5 billion km",
        temperature: "-201°C"
    },
    {
        name: "Kepler-22b",
        exoplanet_value: true,
        density: "5.5 g/cm³",
        atmosphere: "Nitrogen-Oxygen",
        water_presence: "Yes",
        distance: "600 light years",
        temperature: "22°C (habitable zone)"
    },
    {
        name: "Mars",
        exoplanet_value: false,
        density: "3.9 g/cm³",
        atmosphere: "Carbon Dioxide",
        water_presence: "Ice caps",
        distance: "225 million km",
        temperature: "-63°C"
    },
    {
        name: "Proxima Centauri b",
        exoplanet_value: true,
        density: "5.4 g/cm³",
        atmosphere: "Unknown",
        water_presence: "Possible",
        distance: "4.24 light years",
        temperature: "-39°C to 30°C"
    },
    {
        name: "Venus",
        exoplanet_value: false,
        density: "5.2 g/cm³",
        atmosphere: "Carbon Dioxide, Sulfuric Acid",
        water_presence: "No",
        distance: "108 million km",
        temperature: "464°C"
    },
    {
        name: "TRAPPIST-1e",
        exoplanet_value: true,
        density: "5.0 g/cm³",
        atmosphere: "Potentially habitable",
        water_presence: "Likely",
        distance: "39 light years",
        temperature: "-22°C (habitable zone)"
    },
    {
        name: "Jupiter",
        exoplanet_value: false,
        density: "1.3 g/cm³",
        atmosphere: "Hydrogen, Helium",
        water_presence: "Traces in clouds",
        distance: "778 million km",
        temperature: "-108°C"
    },
    {
        name: "HD 209458 b",
        exoplanet_value: true,
        density: "0.4 g/cm³",
        atmosphere: "Hydrogen, Sodium",
        water_presence: "Water vapor detected",
        distance: "159 light years",
        temperature: "1000°C"
    },
    {
        name: "Earth",
        exoplanet_value: false,
        density: "5.5 g/cm³",
        atmosphere: "Nitrogen, Oxygen",
        water_presence: "Yes (71% surface)",
        distance: "0 km (home)",
        temperature: "15°C"
    },
    {
        name: "K2-18b",
        exoplanet_value: true,
        density: "3.3 g/cm³",
        atmosphere: "Hydrogen, Water vapor",
        water_presence: "Yes",
        distance: "124 light years",
        temperature: "-73°C to 47°C"
    },
    {
        name: "Saturn",
        exoplanet_value: false,
        density: "0.7 g/cm³",
        atmosphere: "Hydrogen, Helium",
        water_presence: "Ice in rings",
        distance: "1.4 billion km",
        temperature: "-139°C"
    },
    {
        name: "55 Cancri e",
        exoplanet_value: true,
        density: "5.9 g/cm³",
        atmosphere: "Unknown",
        water_presence: "Unlikely (too hot)",
        distance: "41 light years",
        temperature: "2000°C"
    },
    {
        name: "Neptune",
        exoplanet_value: false,
        density: "1.6 g/cm³",
        atmosphere: "Hydrogen, Helium, Methane",
        water_presence: "Ice/water mantle",
        distance: "4.5 billion km",
        temperature: "-201°C"
    },
    {
        name: "Kepler-22b",
        exoplanet_value: true,
        density: "5.5 g/cm³",
        atmosphere: "Nitrogen-Oxygen",
        water_presence: "Yes",
        distance: "600 light years",
        temperature: "22°C (habitable zone)"
    },
    {
        name: "Mars",
        exoplanet_value: false,
        density: "3.9 g/cm³",
        atmosphere: "Carbon Dioxide",
        water_presence: "Ice caps",
        distance: "225 million km",
        temperature: "-63°C"
    },
    {
        name: "Proxima Centauri b",
        exoplanet_value: true,
        density: "5.4 g/cm³",
        atmosphere: "Unknown",
        water_presence: "Possible",
        distance: "4.24 light years",
        temperature: "-39°C to 30°C"
    },
    {
        name: "Venus",
        exoplanet_value: false,
        density: "5.2 g/cm³",
        atmosphere: "Carbon Dioxide, Sulfuric Acid",
        water_presence: "No",
        distance: "108 million km",
        temperature: "464°C"
    },
    {
        name: "TRAPPIST-1e",
        exoplanet_value: true,
        density: "5.0 g/cm³",
        atmosphere: "Potentially habitable",
        water_presence: "Likely",
        distance: "39 light years",
        temperature: "-22°C (habitable zone)"
    },
    {
        name: "Jupiter",
        exoplanet_value: false,
        density: "1.3 g/cm³",
        atmosphere: "Hydrogen, Helium",
        water_presence: "Traces in clouds",
        distance: "778 million km",
        temperature: "-108°C"
    },
    {
        name: "HD 209458 b",
        exoplanet_value: true,
        density: "0.4 g/cm³",
        atmosphere: "Hydrogen, Sodium",
        water_presence: "Water vapor detected",
        distance: "159 light years",
        temperature: "1000°C"
    },
    {
        name: "Earth",
        exoplanet_value: false,
        density: "5.5 g/cm³",
        atmosphere: "Nitrogen, Oxygen",
        water_presence: "Yes (71% surface)",
        distance: "0 km (home)",
        temperature: "15°C"
    },
    {
        name: "K2-18b",
        exoplanet_value: true,
        density: "3.3 g/cm³",
        atmosphere: "Hydrogen, Water vapor",
        water_presence: "Yes",
        distance: "124 light years",
        temperature: "-73°C to 47°C"
    },
    {
        name: "Saturn",
        exoplanet_value: false,
        density: "0.7 g/cm³",
        atmosphere: "Hydrogen, Helium",
        water_presence: "Ice in rings",
        distance: "1.4 billion km",
        temperature: "-139°C"
    },
    {
        name: "55 Cancri e",
        exoplanet_value: true,
        density: "5.9 g/cm³",
        atmosphere: "Unknown",
        water_presence: "Unlikely (too hot)",
        distance: "41 light years",
        temperature: "2000°C"
    },
    {
        name: "Neptune",
        exoplanet_value: false,
        density: "1.6 g/cm³",
        atmosphere: "Hydrogen, Helium, Methane",
        water_presence: "Ice/water mantle",
        distance: "4.5 billion km",
        temperature: "-201°C"
    }
];

// Simular carga de datos
function loadPlanets() {
    setTimeout(() => {
        renderStarmap(planetData);
    }, 1000);
}

// Renderizar el mapa estelar
function renderStarmap(planets) {
    starmapEl.innerHTML = '';
    
    planets.forEach((planet, index) => {
        const btn = document.createElement('button');
        btn.className = `planet-btn ${planet.exoplanet_value ? 'exoplanet' : 'non-exoplanet'}`;
        btn.setAttribute('aria-label', planet.name);
        btn.dataset.index = index;
        
        btn.addEventListener('click', () => openModal(planet));
        
        starmapEl.appendChild(btn);
    });
}

// info planeta
function openModal(planet) {
    planetNameEl.textContent = planet.name;
    
    planetDetailsEl.innerHTML = `
        <div class="planet-info">
            <strong>Tipo:</strong> ${planet.exoplanet_value ? 'Exoplaneta' : 'Planeta del Sistema Solar'}
        </div>
        <div class="planet-info">
            <strong>Densidad:</strong> ${planet.density}
        </div>
        <div class="planet-info">
            <strong>Atmósfera:</strong> ${planet.atmosphere}
        </div>
        <div class="planet-info">
            <strong>Presencia de agua:</strong> ${planet.water_presence}
        </div>
        <div class="planet-info">
            <strong>Distancia:</strong> ${planet.distance}
        </div>
        <div class="planet-info">
            <strong>Temperatura:</strong> ${planet.temperature}
        </div>
    `;
    
    modalEl.classList.add('active');
}

// Cerrar modal
function closeModal() {
    modalEl.classList.remove('active');
}

closeModalBtn.addEventListener('click', closeModal);

modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Inicializar aplicación
loadPlanets();
