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

// --- API ---

async function fetchPlanetData(planetName) {
    try {  

        const response = await fetch(`http://127.0.0.1:5050/predict?name=${planetName}`);

        if (!response.ok) {
            throw new Error("Could not fetch the data");
        }

        const data = await response.json();
        return data;

        /*
        const koiDisposition = data.koi_disposition;
        const koiPrad = data.koi_prad
        const koiPeriod = data.koi_period 
        const koiTeq = data.koi_teq
        const koiInsol = data.koi_insol 
        const raDec = data.ra;
        */


    }
    catch(error) {
        console.error(error);
        return null;
    }
}

let exoplanetNames = [];

async function loadExoplanetNames() {
    try {
        const response = await fetch('filtered_data.json');
        if (!response.ok) throw new Error("No se pudo cargar filtered_data.json");
        const data = await response.json();

        // Extraer solo los nombres válidos
        exoplanetNames = data
            .map(item => item.kepoi_name)
            .filter(name => !!name);

        console.log(`✅ Se cargaron ${exoplanetNames.length} nombres de exoplanetas.`);
    } catch (err) {
        console.error("Error al cargar nombres de exoplanetas:", err);
    }
}


// --- Generador procedural de planetas ---

async function generatePlanets(count) {
    const baseNames = ["TrES", "HD", "Gliese", "KIC", "OGLE"];
    const types = ["Exoplaneta", "Estrella", "Cometa", "Asteroide", "Galaxia", "AgujeroN"];
    const planets = [];

    const typeColors = {
        "Exoplaneta": "#4ab3ff",
        "Estrella": "#ff4b4b",
        "Cometa": "#33ff99",
        "Asteroide": "#c2a572",
        "Galaxia": "#ffffff",
        "AgujeroN": "#b84bff"
    };

    for (let i = 0; i < count; i++) {
        let type = types[Math.floor(Math.random() * types.length)];

        // --- Elegir nombre ---
        let name;
        if (type === "Exoplaneta" && exoplanetNames.length > 0) {
            // Nombre real desde el JSON
            name = exoplanetNames[Math.floor(Math.random() * exoplanetNames.length)];
        } else {
            // Generar nombre artificial
            const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
            const idNum = Math.floor(Math.random() * 9000) + 1000;
            const suffix = String.fromCharCode(97 + Math.floor(Math.random() * 3));
            name = `${baseName}-${idNum}${suffix}`;
        }

        // --- Llamada a la API ---
        const apiData = await fetchPlanetData(name);
        const koiDisposition = apiData?.koi_disposition || "";
        let isExoplanet = false;
        let probability = apiData?.proba?.false_positive;

        if (koiDisposition === "CONFIRMED") {
            isExoplanet = true;
            type = "Exoplaneta";
            probability = apiData?.proba.confirmed;
        } else {

        isExoplanet = false;
      
        if (type === "Exoplaneta") {
            type = types.filter(t => t !== "Exoplaneta")[Math.floor(Math.random() * (types.length - 1))];
        }
    }

        const color = typeColors[type] || "#aaaaaa";

        planets.push({
            name: name,
            type: type,
            color: color,
            exoplanet_value: isExoplanet,
            koi_disposition: koiDisposition,
            probability: probability !== undefined ? Number(probability).toFixed(2) : "",
            koi_prad: apiData?.koi_prad || "",
            koi_period: apiData?.koi_period || "",
            koi_teq: apiData?.koi_teq || "",
            koi_insol: apiData?.koi_insol || "",
            ra_dec: apiData?.ra || "",
            x: Math.random() * mapSize,
            y: Math.random() * mapSize,
            size: 0.5 + Math.random() * 1.5
        });
    }

    return planets;
}

// -----

let planetData = [];

async function initStarmap() {
    await loadExoplanetNames();
    planetData = await generatePlanets(500);
    centerInitialZoom();
}

initStarmap();

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
        planetBtn.className = 'planet-btn';
        planetBtn.style.backgroundColor = planet.color;
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
            return "gifs/Animated_rotation_of_Pluto.gif"; // gif genérico
        case "Estrella":
            return "gifs/estrella.gif"; // cambia por tu gif de estrella
        case "Cometa":
            return "gifs/cometa.gif"; // gif de cometa
        case "Asteroide":
            return "gifs/asteroide.gif"; // gif de asteroide
        case "Galaxia":
            return "gifs/galaxia.gif"; // gif de galaxia
        case "AgujeroN":
            return "gifs/agujeroN.gif"; // gif de galaxia
        default:
            return "gifs/Animated_rotation_of_Pluto.gif"; // fallback
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
        <div class="planet-info"><strong>Confirmación de Exoplaneta:</strong> ${planet.koi_disposition} → ${planet.probability}</div>
        <div class="planet-info"><strong>Radio Planetario:</strong> ${planet.koi_prad}</div>
        <div class="planet-info"><strong>Periodo orbital (d):</strong> ${planet.koi_period}</div>
        <div class="planet-info"><strong>Temperatura (K):</strong> ${planet.koi_teq}</div>
        <div class="planet-info"><strong>Insolación relativa a la Tierra:</strong> ${planet.koi_insol}</div>
        <div class="planet-info"><strong>Coordenadas celestes:</strong> ${planet.ra_dec}</div>
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
//centerInitialZoom();
