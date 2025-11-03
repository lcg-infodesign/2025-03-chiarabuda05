// =====================================================
// Volcanoes of the World — Final Layout Edition
// Clean light design with sidebar legend and footer
// =====================================================

let volcanoData;
let worldImg;
let fontRegular;

let activeType = null;
let typeColors = {};
let volcanoTypes = [];

// ------------------ PRELOAD ------------------
function preload() {
  volcanoData = loadTable("volcanoes-2025-10-27 - Es.3 - Original Data.csv", "csv", "header");
  worldImg = loadImage("World-map.svg");
  fontRegular = loadFont("https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf");
}
let volcanoDropdownDiv; // contenitore custom
let volcanoDropdownList; // lista opzioni

function setup() {
  createCanvas(windowWidth, windowHeight + 60);
  textFont(fontRegular);
  textAlign(LEFT, CENTER);
  noStroke();

  // Colleziona tipi e assegna colori
  let typeSet = new Set(volcanoData.getColumn("Type"));
  volcanoTypes = Array.from(typeSet);
  assignTypeColors();

  // ---- CREAZIONE DROPDOWN CUSTOM ----
  volcanoDropdownDiv = createDiv('');
  volcanoDropdownDiv.position(25, 130);
  volcanoDropdownDiv.style('width', 'height');
  volcanoDropdownDiv.style('padding', '6px 10px');
  volcanoDropdownDiv.style('border', '2px solid sienna');
  volcanoDropdownDiv.style('border-radius', '6px');
  volcanoDropdownDiv.style('background-color', '#ffffe6');
  volcanoDropdownDiv.style('font-family', 'source code pro, monospace');
  volcanoDropdownDiv.style('font-size', '14px');
  volcanoDropdownDiv.style('color', '#333');
  volcanoDropdownDiv.style('cursor', 'pointer');
  volcanoDropdownDiv.html('All ▾'); // testo iniziale

  // Lista nascosta
  volcanoDropdownList = createDiv('');
volcanoDropdownList.position(25, 130);
volcanoDropdownList.style('width', '180px');
volcanoDropdownList.style('max-height', '300px'); // altezza fissa
volcanoDropdownList.style('overflow-y', 'auto');   // scroll verticale se troppe opzioni
volcanoDropdownList.style('background-color', '#ffffe6');
volcanoDropdownList.style('border', '2px solid sienna');
volcanoDropdownList.style('border-radius', '6px');
volcanoDropdownList.style('display', 'none');
volcanoDropdownList.style('font-family', 'source code pro, monospace');
volcanoDropdownList.style('font-size', '14px');

  // Opzione "All"
  let allOption = createDiv('All');
  allOption.parent(volcanoDropdownList);
  allOption.style('padding', '6px 10px');
  allOption.style('cursor', 'pointer');
  allOption.style('color', '#333');
  allOption.mousePressed(() => {
    activeType = null;
    volcanoDropdownDiv.html('All ▾');
    volcanoDropdownList.style('display', 'none');

  });

  // Opzioni vulcani con colori
  for (let i = 0; i < volcanoTypes.length; i++) {
    let type = volcanoTypes[i];
    let option = createDiv(type);
    option.parent(volcanoDropdownList);
    option.style('padding', '6px 10px');
    option.style('cursor', 'pointer');
    option.style('color', typeColors[type].toString('#rrggbb'));
    option.mousePressed(() => {
      activeType = type;
      volcanoDropdownDiv.html(type + ' ▾');
      volcanoDropdownList.style('display', 'none');
    });
  }

  // Mostra/nascondi lista al click
  volcanoDropdownDiv.mousePressed(() => {
    if (volcanoDropdownList.style('display') === 'none') {
      volcanoDropdownList.style('display', 'block');
    } else {
      volcanoDropdownList.style('display', 'none');
    }
  });
}

// ------------------ DRAW ------------------
function draw() {
  background(color(255, 255, 230));

  drawTitle();
  drawFooter();

  drawLegendBox(); // box dietro il dropdown

  // Area mappa
  let margin = 20;
  let mapX = margin;
  let mapY = 140; // lascia spazio per titolo e dropdown
  let maxMapW = width - 2 * margin;
  let maxMapH = height - mapY - 40;

  // Mantieni proporzioni immagine
  let scale = min(maxMapW / worldImg.width, maxMapH / worldImg.height);
  let mapW = worldImg.width * scale;
  let mapH = worldImg.height * scale;

  drawWorldMap(mapX, mapY, mapW, mapH);
  drawVolcanoes(mapX, mapY, mapW, mapH);
}



// ------------------ TITLE ------------------
function drawTitle() {
  textAlign(CENTER);
  textSize(30);
  textStyle(BOLD);
  fill(color(50, 100, 150));
  text("Volcanoes of the World", width / 2, 50);
}

function drawFooter() {
  textAlign(CENTER);
  let footerY = height-20; // più vicino alla mappa
  textSize(12);
  fill(50); 
  text("Chiara Buda — Assignment 2", width / 2, footerY);
}


// ---- MAPPA 
function drawWorldMap(mapX, mapY, mapW, mapH) {
  imageMode(CORNER);
  image(worldImg, mapX, mapY, mapW, mapH); // nessuna tinta
}

// --VULCANI 
function drawVolcanoes(mapX, mapY, mapW, mapH) {
  for (let r = 0; r < volcanoData.getRowCount(); r++) {
    let row = volcanoData.getRow(r);
    let lat = float(row.get("Latitude"));
    let lon = float(row.get("Longitude"));
    let type = row.get("Type");
    let elev = float(row.get("Elevation (m)"));
    let name = row.get("Volcano Name") || "Unknown";

    // Filtra in base al tipo selezionato
    if (activeType && type !== activeType) continue;

    let x = map(lon, -180, 180, mapX, mapX + mapW);
    let y = map(lat, 90, -90, mapY, mapY + mapH);

    let c = typeColors[type] || color(100);
    fill(c);
    noStroke();
    let size = map(elev, 0, 6000, 4, 12);
    ellipse(x, y, size, size);

    // Tooltip su hover
    if (dist(mouseX, mouseY, x, y) < size / 1.5) {
      drawTooltip(name, type, elev);
    }
  }
}
function drawLegendBox() {
  let boxX = 15; // margine sinistro
  let boxY = 75; // sopra la mappa, dietro il dropdown
  let boxW = 320; 
  let boxH = 100;  // più alto per la guida

  push();
  fill(245, 235, 210, 220); // semi-trasparente chiaro
  stroke(139, 69, 19);      // bordo sienna
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 8); // rettangolo arrotondato

  // Testo guida
  noStroke();
  fill(50);
  textSize(12);
  textAlign(LEFT, TOP);
  text("Select a volcano type from the dropdown\nor hover on a volcano to see details.", boxX + 10, boxY + 10);
  pop();
}



// ------------------ TOOLTIP ------------------
function drawTooltip(name, type, elev) {
  push();
  textSize(12);
  let txt = `${name}\n${type}\n${nf(elev, 0, 0)} m`;
  let w = 160;
  let h = 50;

  fill(255, 235);
  stroke(180);
  rect(mouseX + 10, mouseY - h, w, h, 6);
  noStroke();
  fill(20);
  text(txt, mouseX + 18, mouseY - h + 15);
  pop();
}

// ------------------ COLOR PALETTE ------------------
function assignTypeColors() {
  let palette = [
    color(139, 69, 19),   // sienna
    color(160, 82, 45),   // brown
    color(205, 133, 63),  // peru
    color(222, 184, 135), // burlywood
    color(128, 128, 128), // grey
    color(210, 180, 140), // tan
    color(112, 128, 144)  // slate grey
  ];
  for (let i = 0; i < volcanoTypes.length; i++) {
    typeColors[volcanoTypes[i]] = palette[i % palette.length];
  }
}

// ------------------ INTERACTION ------------------
function mousePressed() {
  let margin = 40;
  let boxSize = 14;
  let spacing = 22;
  let x0 = margin;
  let y0 = 190;

  for (let i = 0; i < volcanoTypes.length; i++) {
    let bx = x0;
    let by = y0 + i * spacing;
    if (
      mouseX > bx &&
      mouseX < width * 0.3 &&
      mouseY > by &&
      mouseY < by + boxSize
    ) {
      if (activeType === volcanoTypes[i]) {
        activeType = null;
      } else {
        activeType = volcanoTypes[i];
      }
    }
  }
}

// ------------------ RESIZE ------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
