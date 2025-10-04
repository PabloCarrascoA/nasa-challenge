
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

let viewX = 0;       // esquina superior izquierda de la vista
let viewY = 0;
let viewSize = 100;  // tamaño de la vista inicial (100x100 unidades)
const mapSize = 1000; // tamaño real del mapa

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
            x: Math.random()*mapSize,   // coordenadas reales
            y: Math.random()*mapSize,
            size: 0.5 + Math.random()*1.5 // tamaño entre 0.5 y 2
        });
    }

    return planets;
}

// Generar cantidad de planetas aleatorios
const planetData = generatePlanets(500);


// Simular carga de datos
function loadPlanets() {
    setTimeout(() => {
        renderStarmap(planetData);
    }, 1000);
}

starmapEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if(e.deltaY < 0){
        // hacer zoom in
        viewSize /= zoomFactor;
    } else {
        // hacer zoom out
        viewSize *= zoomFactor;
        if(viewSize > mapSize) viewSize = mapSize; // límite
    }
    renderStarmap(planetData);
});
let isDragging = false;
let dragStart = {x:0, y:0};
let viewStart = {x:0, y:0};

starmapEl.addEventListener('mousedown', (e)=>{
    isDragging = true;
    dragStart = {x: e.clientX, y: e.clientY};
    viewStart = {x: viewX, y: viewY};
    starmapEl.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e)=>{
    if(!isDragging) return;
    const scale = viewSize / starmapEl.clientWidth;
    viewX = viewStart.x - (e.clientX - dragStart.x)*scale;
    viewY = viewStart.y - (e.clientY - dragStart.y)*scale;

    // Limitar para que no se salga del mapa
    viewX = Math.max(0, Math.min(mapSize - viewSize, viewX));
    viewY = Math.max(0, Math.min(mapSize - viewSize, viewY));

    renderStarmap(planetData);
});

document.addEventListener('mouseup', ()=>{
    isDragging = false;
    starmapEl.style.cursor = 'grab';
});

function renderStarmap(planets) {
    starmapEl.innerHTML = '';
    
    planets.forEach((planet, index) => {
        // Convertir coordenadas del planeta (0-1000) a la vista actual
        const scale = starmapEl.clientWidth / viewSize; // píxeles por unidad
        const left = (planet.x - viewX) * scale;
        const top  = (planet.y - viewY) * scale;

        // Solo renderizar si está dentro de la vista
        if(left < -100 || left > starmapEl.clientWidth + 100) return;
        if(top  < -100 || top  > starmapEl.clientHeight + 100) return;

        const planetBtn = document.createElement('button');
        planetBtn.className = `planet-btn ${planet.exoplanet_value ? 'exoplanet' : 'non-exoplanet'}`;

        // Tamaño aleatorio base
        const planetScale = planet.size * scale / 60; // ajusta según tu CSS
        planetBtn.style.transform = `translate(${left}px, ${top}px) scale(${planetScale})`;
        planetBtn.style.position = 'absolute';
        planetBtn.dataset.index = index;

        planetBtn.addEventListener('click', () => openModal(planet));
        starmapEl.appendChild(planetBtn);
    });
}

// info planeta
function openModal(planet) {
    planetNameEl.textContent = planet.name;

    // Generar un color aleatorio vía hue
    const randomHue = Math.floor(Math.random() * 360); // 0 a 360 grados

    // Crear el GIF con hue dinámico
    const gifHtml = `
      <div class="planet-gif-wrapper" style="--hue: ${randomHue}deg;">
          <img src="./Animated_rotation_of_Pluto.gif" alt="Planeta girando" class="planet-gif">
      </div>
    `;

    // Insertar GIF + info del planeta en un solo innerHTML
    planetDetailsEl.innerHTML = `
      ${gifHtml}
      <div class="planet-info">
          <strong>Tipo:</strong> ${planet.type}
      </div>
      <div class="planet-info">
          <strong>Densidad:</strong> ${planet.density}</div>
      <div class="planet-info">
          <strong>Atmósfera:</strong> ${planet.atmosphere}</div>
      <div class="planet-info">
          <strong>Presencia de agua:</strong> ${planet.water_presence}</div>
      <div class="planet-info">
          <strong>Distancia:</strong> ${planet.distance}</div>
      <div class="planet-info">
          <strong>Temperatura:</strong> ${planet.temperature}</div>
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

const addDataBtn = document.getElementById('addDataBtn');
const accuracyEl = document.getElementById('accuracy');
const recallEl = document.getElementById('recall');
const lrInput = document.getElementById('learningRate');
const lrVal = document.getElementById('lrVal');
const epochsInput = document.getElementById('epochs');
const epochsVal = document.getElementById('epochsVal');

addDataBtn.addEventListener('click', () => {
    alert('Simulando la carga de nuevos datos...');
    // Aquí podrías añadir planetas nuevos al starmap para simular "nuevo dataset"
    const newPlanets = generatePlanets(50);
    planetData.push(...newPlanets);
    renderStarmap(planetData);

    // Simular actualización de métricas
    const randomAccuracy = (Math.random() * 0.2 + 0.8).toFixed(2);
    const randomRecall = (Math.random() * 0.2 + 0.7).toFixed(2);
    accuracyEl.textContent = randomAccuracy;
    recallEl.textContent = randomRecall;
});

lrInput.addEventListener('input', () => {
    lrVal.textContent = lrInput.value;
    // Aquí puedes simular reentrenar modelo con nuevo learning rate
});

epochsInput.addEventListener('input', () => {
    epochsVal.textContent = epochsInput.value;
    // Aquí puedes simular reentrenar modelo con nuevo número de epochs
});
