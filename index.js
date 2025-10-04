const starmapEl = document.getElementById('starmap');
const modalEl = document.getElementById('modal');
const planetNameEl = document.getElementById('planetName');
const planetDetailsEl = document.getElementById('planetDetails');
const closeModalBtn = document.getElementById('closeModal');
const floatingPanel = document.getElementById('floatingPanel');
const floatingPanelSimple = document.getElementById('floatingPanelSimple');
const showPanelBtn = document.getElementById('showPanelBtn');
const closePanelBtn = document.getElementById('closePanelBtn');

showPanelBtn.addEventListener('click', () => {
    floatingPanelSimple.style.display = 'none';
    floatingPanel.style.display = 'block';
});

closePanelBtn.addEventListener('click', () => {
    floatingPanel.style.display = 'none';
    floatingPanelSimple.style.display = 'block';
})

let viewX = 0;
let viewY = 0;
let viewSize = 100;
const mapSize = 1000;

// --- Generador procedural de planetas ---

function generatePlanets(count) {
    const atmospheres = ["Nitrogen-Oxygen", "Carbon Dioxide", "Methane", "Hydrogen-Helium", "Sulfuric Acid", "Ammonia", "Unknown"];
    const waterOptions = ["Yes", "No", "Ice caps", "Possible", "Water vapor"];
    const baseNames = ["Kepler", "Trappist", "Proxima", "Gliese", "HD", "Tau", "Luyten", "Ross", "Wolf"];
    const types = ["Exoplaneta", "Planeta del Sistema Solar", "Estrella", "Cometa", "Asteroide","Galaxia","AgujeroN"];
    const planets = [];

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const isExoplanet = type === "Exoplaneta";
        const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
        const idNum = Math.floor(Math.random() * 1000) + 1;
        const suffix = String.fromCharCode(97 + Math.floor(Math.random() * 3));

        planets.push({
            name: `${baseName}-${idNum}${suffix}`,
            type: type,
            exoplanet_value: isExoplanet,
            density: (Math.random() * 6 + 0.5).toFixed(1) + " g/cm³",
            atmosphere: atmospheres[Math.floor(Math.random() * atmospheres.length)],
            water_presence: waterOptions[Math.floor(Math.random() * waterOptions.length)],
            distance: isExoplanet
                ? (Math.random() * 2000 + 1).toFixed(2) + " light years"
                : (Math.random() * 6 + 0.3).toFixed(1) + " billion km",
            temperature: (Math.random() * 400 - 200).toFixed(1) + "°C",
            x: Math.random() * mapSize,
            y: Math.random() * mapSize,
            size: 0.5 + Math.random() * 1.5
        });
    }
    return planets;
}

// -----

const planetData = generatePlanets(500);

// --- Nave ---
const nave = {
    name: "Navecita",
    x: mapSize / 2,
    y: mapSize / 2,
    size: 2,
    rotation: 0,
    image: "images/navecita.png"
};

// --- Flecha (para cuando la nave sale de la vista) ---

let arrowEl = document.createElement('div');
arrowEl.id = 'nave-arrow';
arrowEl.style.position = 'absolute';
arrowEl.style.width = '40px';
arrowEl.style.height = '40px';
arrowEl.style.background = 'url("images/flecha.png") no-repeat center/contain';
arrowEl.style.transformOrigin = 'center center';
arrowEl.style.display = 'none';
starmapEl.appendChild(arrowEl);

// --- Render principal ---

function renderStarmap(planets) {
    starmapEl.innerHTML = '';
    starmapEl.appendChild(arrowEl);

    const scale = starmapEl.clientWidth / viewSize;

    // --- Render nave ---

    const naveLeft = (nave.x - viewX) * scale;
    const naveTop = (nave.y - viewY) * scale;
    const naveRotation = nave.rotation || 0;

    const naveOnScreen =
        naveLeft >= 0 && naveLeft <= starmapEl.clientWidth &&
        naveTop >= 0 && naveTop <= starmapEl.clientHeight;

    if (naveOnScreen) {
        arrowEl.style.display = 'none';
    } else {
        arrowEl.style.display = 'block';
        const dirX = nave.x - (viewX + viewSize / 2);
        const dirY = nave.y - (viewY + viewSize / 2);
        const angle = Math.atan2(dirY, dirX);
        const margin = 20;
        const halfW = starmapEl.clientWidth / 2 - margin;
        const halfH = starmapEl.clientHeight / 2 - margin;
        const ratioX = Math.cos(angle);
        const ratioY = Math.sin(angle);
        const scaleFactor = Math.min(halfW / Math.abs(ratioX || 0.01), halfH / Math.abs(ratioY || 0.01));
        const arrowX = starmapEl.clientWidth / 2 + ratioX * scaleFactor - 20;
        const arrowY = starmapEl.clientHeight / 2 + ratioY * scaleFactor - 20;
        arrowEl.style.left = `${arrowX}px`;
        arrowEl.style.top = `${arrowY}px`;
        arrowEl.style.transform = `rotate(${angle}rad)`;
    }

    // --- Dibuja la nave ---
    const naveEl = document.createElement('div');
    naveEl.className = 'planet-btn nave';
    naveEl.style.width = '150px';
    naveEl.style.height = '150px';
    naveEl.style.position = 'absolute';
    naveEl.style.background = `url(${nave.image}) no-repeat center/contain`;
    naveEl.style.border = 'none';
    naveEl.style.transform = `
        translate(${naveLeft}px, ${naveTop}px)
        scale(${nave.size * scale / 60})
        rotate(${naveRotation}rad)
    `;
    starmapEl.appendChild(naveEl);

    // --- Render planetas ---

    planets.forEach((planet, index) => {
        const left = (planet.x - viewX) * scale;
        const top = (planet.y - viewY) * scale;

        if (left < -100 || left > starmapEl.clientWidth + 100) return;
        if (top < -100 || top > starmapEl.clientHeight + 100) return;

        const planetBtn = document.createElement('button');
        planetBtn.className = `planet-btn ${planet.exoplanet_value ? 'exoplanet' : 'non-exoplanet'}`;
        const planetScale = planet.size * scale / 60;
        planetBtn.style.transform = `translate(${left}px, ${top}px) scale(${planetScale})`;
        planetBtn.style.position = 'absolute';
        planetBtn.dataset.index = index;

        planetBtn.addEventListener('click', () => openModal(planet));
        starmapEl.appendChild(planetBtn);
    });
}

// --- Movimiento de la nave hacia un planeta ---

function moveShipToPlanet(planet, callback) {
    const steps = 80;
    let step = 0;
    const startX = nave.x;
    const startY = nave.y;
    const deltaX = planet.x - startX;
    const deltaY = planet.y - startY;

    const targetAngle = Math.atan2(deltaY, deltaX);

    const anim = setInterval(() => {
        step++;
        const progress = step / steps;

        // Interpolación suave de rotación
        const currentAngle = nave.rotation || 0;
        let deltaAngle = targetAngle - currentAngle;
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
        nave.rotation = currentAngle + deltaAngle * 0.1;

        // Movimiento lineal
        nave.x = startX + deltaX * progress;
        nave.y = startY + deltaY * progress;

        renderStarmap(planetData);

        if (step >= steps) {
            clearInterval(anim);
            nave.rotation = targetAngle;
            renderStarmap(planetData);
            if (callback) callback();
        }
    }, 16);
}

// --- Zoom inicial ---

function centerInitialZoom() {
    const centerX = mapSize / 2;
    const centerY = mapSize / 2;

    viewSize = 10;
    viewX = centerX - viewSize / 2;
    viewY = centerY - viewSize / 2;

    renderStarmap(planetData);

    const targetViewSize = 100;
    const steps = 60;
    let step = 0;

    const zoomAnimation = setInterval(() => {
        step++;
        viewSize = 10 + (targetViewSize - 10) * (step / steps);
        viewX = centerX - viewSize / 2;
        viewY = centerY - viewSize / 2;

        renderStarmap(planetData);

        if (step >= steps) clearInterval(zoomAnimation);
    }, 16);
}

// --- Drag y zoom ---

let isDragging = false;
let dragStart = { x: 0, y: 0 };
let viewStart = { x: 0, y: 0 };

starmapEl.addEventListener('mousedown', e => {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    viewStart = { x: viewX, y: viewY };
    starmapEl.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const scale = viewSize / starmapEl.clientWidth;
    viewX = viewStart.x - (e.clientX - dragStart.x) * scale;
    viewY = viewStart.y - (e.clientY - dragStart.y) * scale;

    viewX = Math.max(0, Math.min(mapSize - viewSize, viewX));
    viewY = Math.max(0, Math.min(mapSize - viewSize, viewY));

    renderStarmap(planetData);
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    starmapEl.style.cursor = 'grab';
});

starmapEl.addEventListener('wheel', e => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
        viewSize /= zoomFactor;
    } else {
        viewSize *= zoomFactor;
        if (viewSize > mapSize) viewSize = mapSize;
    }
    renderStarmap(planetData);
});

// --- Modal planeta ---

function openModal(planet) {
    moveShipToPlanet(planet, () => showPlanetModal(planet));
}

function getPlanetGif(planet) {
    switch (planet.type) {
        case "Exoplaneta":
        case "Planeta del Sistema Solar":
            return "./Animated_rotation_of_Pluto.gif"; // el gif que ya usas
        case "Estrella":
            return "./estrella.gif"; // cambia por tu gif de estrella
        case "Cometa":
            return "./cometa.gif"; // gif de cometa
        case "Asteroide":
            return "./asteroide.gif"; // gif de asteroide
        case "Galaxia":
            return "./galaxia.gif"; // gif de galaxia
        case "AgujeroN":
            return "./agujeroN.gif"; // gif de galaxia
        default:
            return "./Animated_rotation_of_Pluto.gif"; // fallback
    }
}

function showPlanetModal(planet) {
    planetNameEl.textContent = planet.name;

    const randomHue = Math.floor(Math.random() * 360);
    const gifUrl = getPlanetGif(planet);
    const gifHtml = `
        <div class="planet-gif-wrapper" style="--hue: ${randomHue}deg;">
            <img src="${gifUrl}" alt="${planet.type}" class="planet-gif">
        </div>
    `;

    planetDetailsEl.innerHTML = `
        ${gifHtml}
        <div class="planet-info"><strong>Tipo:</strong> ${planet.type}</div>
        <div class="planet-info"><strong>Densidad:</strong> ${planet.density}</div>
        <div class="planet-info"><strong>Atmósfera:</strong> ${planet.atmosphere}</div>
        <div class="planet-info"><strong>Presencia de agua:</strong> ${planet.water_presence}</div>
        <div class="planet-info"><strong>Distancia:</strong> ${planet.distance}</div>
        <div class="planet-info"><strong>Temperatura:</strong> ${planet.temperature}</div>
    `;

    modalEl.classList.add('active');
    addExoplanet(planet);
}

function closeModal() {
    modalEl.classList.remove('active');
}
closeModalBtn.addEventListener('click', closeModal);
modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// --- Inicializar ---
updateScoreDisplay();
centerInitialZoom();