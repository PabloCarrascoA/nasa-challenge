const starmapEl = document.getElementById('starmap');
const modalEl = document.getElementById('modal');
const planetNameEl = document.getElementById('planetName');
const planetDetailsEl = document.getElementById('planetDetails');
const closeModalBtn = document.getElementById('closeModal');

let viewX = 0;
let viewY = 0;
let viewSize = 100;
const mapSize = 1000;

// --- Generador procedural de planetas ---
function generatePlanets(count) {
    const atmospheres = ["Nitrogen-Oxygen","Carbon Dioxide","Methane","Hydrogen-Helium","Sulfuric Acid","Ammonia","Unknown"];
    const waterOptions = ["Yes","No","Ice caps","Possible","Water vapor"];
    const baseNames = ["Kepler","Trappist","Proxima","Gliese","HD","Tau","Luyten","Ross","Wolf"];
    const types = ["Exoplaneta", "Planeta del Sistema Solar", "Estrella", "Cometa", "Asteroide"];
    const planets = [];

    for(let i=0;i<count;i++){
        const type = types[Math.floor(Math.random()*types.length)];
        var isExoplanet = false;
        if (type === "Exoplaneta") {
            isExoplanet = true;
        }
        const baseName = baseNames[Math.floor(Math.random()*baseNames.length)];
        const idNum = Math.floor(Math.random()*1000)+1;
        const suffix = String.fromCharCode(97 + Math.floor(Math.random()*3));

        planets.push({
            name:`${baseName}-${idNum}${suffix}`,
            type: type,
            exoplanet_value: isExoplanet,
            density: (Math.random()*6+0.5).toFixed(1) + " g/cm³",
            atmosphere: atmospheres[Math.floor(Math.random()*atmospheres.length)],
            water_presence: waterOptions[Math.floor(Math.random()*waterOptions.length)],
            distance: isExoplanet ? (Math.random()*2000+1).toFixed(2)+" light years" : (Math.random()*6+0.3).toFixed(1)+" billion km",
            temperature: (Math.random()*400-200).toFixed(1)+"°C",
            x: Math.random()*mapSize,
            y: Math.random()*mapSize,
            size: 0.5 + Math.random()*1.5
        });
    }

    return planets;
}

// Planetas
const planetData = generatePlanets(500);

// Nave
const nave = {
    name: "Navecita",
    x: mapSize / 2,
    y: mapSize / 2,
    size: 2,
    image: "images/navecita.png"
};

// --- Render del starmap ---
// Crear flecha
let arrowEl = document.createElement('div');
arrowEl.id = 'nave-arrow';
arrowEl.style.position = 'absolute';
arrowEl.style.width = '40px';
arrowEl.style.height = '40px';
arrowEl.style.background = 'url("images/flecha.png") no-repeat center/contain';
arrowEl.style.transformOrigin = 'center center';
arrowEl.style.display = 'none';
starmapEl.appendChild(arrowEl);

function renderStarmap(planets) {
    starmapEl.innerHTML = '';
    starmapEl.appendChild(arrowEl); // volver a añadir flecha

    const scale = starmapEl.clientWidth / viewSize;

    // --- Render nave ---
    const naveLeft = (nave.x - viewX) * scale;
    const naveTop  = (nave.y - viewY) * scale;
    const naveOnScreen = 
        naveLeft >= 0 && naveLeft <= starmapEl.clientWidth &&
        naveTop  >= 0 && naveTop  <= starmapEl.clientHeight;

    if(naveOnScreen){
        arrowEl.style.display = 'none';
    } else {
        arrowEl.style.display = 'block';
        // calcular vector desde centro de la vista hasta nave
        const centerX = viewSize/2;
        const centerY = viewSize/2;

        const dirX = nave.x - (viewX + viewSize/2);
        const dirY = nave.y - (viewY + viewSize/2);
        const angle = Math.atan2(dirY, dirX); // radianes

        // posición de la flecha en los bordes
        const margin = 20;
        const halfW = starmapEl.clientWidth/2 - margin;
        const halfH = starmapEl.clientHeight/2 - margin;

        const ratioX = Math.cos(angle);
        const ratioY = Math.sin(angle);
        // limitar posición al rectángulo del mapa
        const scaleFactor = Math.min(halfW/Math.abs(ratioX || 0.01), halfH/Math.abs(ratioY || 0.01));
        const arrowX = starmapEl.clientWidth/2 + ratioX*scaleFactor - 20; // 20 = half width
        const arrowY = starmapEl.clientHeight/2 + ratioY*scaleFactor - 20; // 20 = half height

        arrowEl.style.left = `${arrowX}px`;
        arrowEl.style.top  = `${arrowY}px`;
        arrowEl.style.transform = `rotate(${angle}rad)`;
    }

    // --- Render nave ---
    const naveEl = document.createElement('div');
    naveEl.className = 'planet-btn';
    naveEl.style.width = '60px';
    naveEl.style.height = '60px';
    naveEl.style.transform = `translate(${naveLeft}px, ${naveTop}px) scale(${nave.size * scale / 60})`;
    naveEl.style.position = 'absolute';
    naveEl.style.background = `url(${nave.image}) no-repeat center/contain`;
    naveEl.style.border = 'none';
    starmapEl.appendChild(naveEl);

    // --- Render planetas ---
    planets.forEach((planet, index) => {
        const left = (planet.x - viewX) * scale;
        const top  = (planet.y - viewY) * scale;

        if(left < -100 || left > starmapEl.clientWidth + 100) return;
        if(top  < -100 || top  > starmapEl.clientHeight + 100) return;

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

// --- Función de zoom inicial centrado ---
function centerInitialZoom() {
    const centerX = mapSize / 2;
    const centerY = mapSize / 2;

    viewSize = 10;
    viewX = centerX - viewSize/2;
    viewY = centerY - viewSize/2;

    renderStarmap(planetData);

    const targetViewSize = 100;
    const steps = 60;
    let step = 0;

    const zoomAnimation = setInterval(() => {
        step++;
        viewSize = 10 + (targetViewSize - 10) * (step/steps);
        viewX = centerX - viewSize/2;
        viewY = centerY - viewSize/2;

        renderStarmap(planetData);

        if(step >= steps) clearInterval(zoomAnimation);
    }, 16);
}

// --- Drag y zoom ---
let isDragging = false;
let dragStart = {x:0, y:0};
let viewStart = {x:0, y:0};

starmapEl.addEventListener('mousedown', e=>{
    isDragging = true;
    dragStart = {x:e.clientX, y:e.clientY};
    viewStart = {x:viewX, y:viewY};
    starmapEl.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', e=>{
    if(!isDragging) return;
    const scale = viewSize / starmapEl.clientWidth;
    viewX = viewStart.x - (e.clientX - dragStart.x) * scale;
    viewY = viewStart.y - (e.clientY - dragStart.y) * scale;

    viewX = Math.max(0, Math.min(mapSize - viewSize, viewX));
    viewY = Math.max(0, Math.min(mapSize - viewSize, viewY));

    renderStarmap(planetData);
});

document.addEventListener('mouseup', ()=>{
    isDragging = false;
    starmapEl.style.cursor = 'grab';
});

starmapEl.addEventListener('wheel', e=>{
    e.preventDefault();
    const zoomFactor = 1.1;
    if(e.deltaY < 0){
        viewSize /= zoomFactor;
    } else {
        viewSize *= zoomFactor;
        if(viewSize > mapSize) viewSize = mapSize;
    }
    renderStarmap(planetData);
});

// --- Modal planeta ---
function openModal(planet) {
    planetNameEl.textContent = planet.name;
    const randomHue = Math.floor(Math.random() * 360);
    const gifHtml = `
      <div class="planet-gif-wrapper" style="--hue:${randomHue}deg;">
          <img src="./Animated_rotation_of_Pluto.gif" alt="Planeta girando" class="planet-gif">
      </div>
    `;
    planetDetailsEl.innerHTML = `
      ${gifHtml}
      <div class="planet-info"><strong>Tipo:</strong> ${planet.exoplanet_value ? 'Exoplaneta' : 'Planeta del Sistema Solar'}</div>
      <div class="planet-info"><strong>Densidad:</strong> ${planet.density}</div>
      <div class="planet-info"><strong>Atmósfera:</strong> ${planet.atmosphere}</div>
      <div class="planet-info"><strong>Presencia de agua:</strong> ${planet.water_presence}</div>
      <div class="planet-info"><strong>Distancia:</strong> ${planet.distance}</div>
      <div class="planet-info"><strong>Temperatura:</strong> ${planet.temperature}</div>
    `;
    modalEl.classList.add('active');
}

function closeModal() {
    modalEl.classList.remove('active');
}
closeModalBtn.addEventListener('click', closeModal);
modalEl.addEventListener('click', e=>{ if(e.target===modalEl) closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

// --- Inicializar ---
centerInitialZoom();
