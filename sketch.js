// =====================================================
// Volcanoes of the World — Single Selected Volcano + Highlight
// =====================================================

let volcanoData;
let worldImg;
let fontRegular;

let activeType = null;
let typeColors = {};
let volcanoTypes = [];

let selectedVolcano = null; // solo un vulcano selezionato

// ------------------ PRELOAD ------------------
function preload() {
  volcanoData = loadTable("volcanoes-2025-10-27 - Es.3 - Original Data.csv", "csv", "header");
  worldImg = loadImage("World-map.svg");
  fontRegular = loadFont("https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf");
}

// ------------------ SETUP ------------------
let volcanoDropdownDiv;
let volcanoDropdownList;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(fontRegular);
  textAlign(LEFT, CENTER);
  noStroke();

  let typeSet = new Set(volcanoData.getColumn("Type"));
  volcanoTypes = Array.from(typeSet);
  assignTypeColors();

  createDropdown();
}

// ------------------ DRAW ------------------
function draw() {
  background(255, 255, 230);

  drawTitle();
  drawFooter();
  drawLegendBox();

  let mapMargin = 20;
  let mapY = 130;
  let maxMapW = width - 2 * mapMargin;
  let maxMapH = height - mapY - 40;
  let scale = min(maxMapW / worldImg.width, maxMapH / worldImg.height);
  let mapW = worldImg.width * scale;
  let mapH = worldImg.height * scale;
  let mapX = (width - mapW) / 2;

  drawWorldMap(mapX, mapY, mapW, mapH);
  drawVolcanoes(mapX, mapY, mapW, mapH);
}

// ------------------ TITLE & FOOTER ------------------
function drawTitle() {
  textAlign(CENTER);
  textSize(50);
  textStyle(fontRegular);
  fill(50, 100, 150);
  textAlign(RIGHT);

  text("Volcanoes of the World", width -20, 50);
}

function drawFooter() {
  textAlign(CENTER);
  textSize(12);
  fill(50);
  text("Chiara Buda — Assignment 2", width / 2, height - 20);
}

// ------------------ MAP & VOLCANOES ------------------
function drawWorldMap(mapX, mapY, mapW, mapH) {
  imageMode(CORNER);
  image(worldImg, mapX, mapY, mapW, mapH);
}

function drawVolcanoes(mapX, mapY, mapW, mapH) {
  let closestDist = Infinity;
  selectedVolcano = null;

  for (let r = 0; r < volcanoData.getRowCount(); r++) {
    let row = volcanoData.getRow(r);
    let lat = float(row.get("Latitude"));
    let lon = float(row.get("Longitude"));
    let type = row.get("Type");
    let elev = float(row.get("Elevation (m)"));
    let name = row.get("Volcano Name") || "Unknown";

    if (activeType && type !== activeType) continue;

    let x = map(lon, -170, 190, mapX, mapX + mapW);
    let y = map(lat, 80, -80, mapY, mapY + mapH);
    let size = map(elev, 0, 6000, 4, 12);
    let c = typeColors[type] || color(100);

    // verifica distanza dal mouse
    let d = dist(mouseX, mouseY, x, y);
    if (d < size / 1.5 && d < closestDist) {
      closestDist = d;
      selectedVolcano = { name, type, elev, x, y, size, c };
    }
  }

  // Disegna tutti i vulcani
  for (let r = 0; r < volcanoData.getRowCount(); r++) {
    let row = volcanoData.getRow(r);
    let lat = float(row.get("Latitude"));
    let lon = float(row.get("Longitude"));
    let type = row.get("Type");
    let elev = float(row.get("Elevation (m)"));
    let name = row.get("Volcano Name") || "Unknown";

    if (activeType && type !== activeType) continue;

    let x = map(lon, -170, 190, mapX, mapX + mapW);
    let y = map(lat, 80, -80, mapY, mapY + mapH);
    let size = map(elev, 0, 6000, 4, 12);
    let c = typeColors[type] || color(100);

    if (selectedVolcano && selectedVolcano.name === name) {
      // Evidenzia puntino selezionato
      fill(180,25,0);
      ellipse(x, y, size + 4, size + 4);
    }

    fill(c);
    noStroke();
    ellipse(x, y, size, size);
  }

  // Tooltip del vulcano selezionato
  if (selectedVolcano) {
    drawTooltip(selectedVolcano);
  }
}

// ------------------ TOOLTIP ------------------
function drawTooltip(volcano) {
  push();
  textSize(12);
  let padding = 8;
  let txtLines = [`${volcano.name}`, `${volcano.type}`, `${nf(volcano.elev, 0, 0)} m`];
  let tw = max(txtLines.map(t => textWidth(t))) + 2 * padding;
  let th = txtLines.length * 14 + 2 * padding;

  // posizione iniziale
  let tx = volcano.x + 15;
  let ty = volcano.y - th - 10;

  if (tx + tw > width) tx = volcano.x - tw - 15;
  if (ty < 0) ty = volcano.y + 15;

  fill(255, 250, 240, 220);
  stroke(180);
  rect(tx, ty, tw, th, 6);

  noStroke();
  fill(20);
  textAlign(LEFT, TOP);
  for (let i = 0; i < txtLines.length; i++) {
    text(txtLines[i], tx + padding, ty + padding + i * 14);
  }
  pop();
}

// ------------------ LEGEND ------------------
function drawLegendBox() {
  let boxX = 35;
  let boxY = 45;
  let boxW = 312;
  let boxH = 100;

  push();
  fill(245, 235, 210, 220);
  stroke(139, 69, 19);
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 8);

  noStroke();
  fill(50);
  textSize(14);
  textAlign(LEFT, TOP); 
  text("Select a volcano type" , boxX + 10, boxY + 10);
  text("or hover on the map to see details.", boxX + 10, boxY + 26);
  pop();
}

// ------------------ DROPDOWN ------------------
function createDropdown() {
  volcanoDropdownDiv = createDiv('All ▾');
  volcanoDropdownDiv.position(45, 102);
  volcanoDropdownDiv.style('padding', '6px 10px');
  volcanoDropdownDiv.style('border', '2px solid sienna');
  volcanoDropdownDiv.style('border-radius', '6px');
  volcanoDropdownDiv.style('background-color', '#ffffe6');
  volcanoDropdownDiv.style('font-family', 'source code pro, monospace');
  volcanoDropdownDiv.style('font-size', '14px');
  volcanoDropdownDiv.style('cursor', 'pointer');

  volcanoDropdownList = createDiv('');
  volcanoDropdownList.position(45, 69 + volcanoDropdownDiv.size().height);
  volcanoDropdownList.style('width', '180px');
  volcanoDropdownList.style('max-height', '300px');
  volcanoDropdownList.style('overflow-y', 'auto');
  volcanoDropdownList.style('background-color', '#ffffe6');
  volcanoDropdownList.style('border', '2px solid sienna');
  volcanoDropdownList.style('border-radius', '6px');
  volcanoDropdownList.style('display', 'none');
  volcanoDropdownList.style('font-family', 'source code pro, monospace');
  volcanoDropdownList.style('font-size', '14px');

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

  for (let type of volcanoTypes) {
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

  volcanoDropdownDiv.mousePressed(() => {
    if (volcanoDropdownList.style('display') === 'none') {
      volcanoDropdownList.style('display', 'block');
    } else {
      volcanoDropdownList.style('display', 'none');
    }
  });
}

// ------------------ COLOR PALETTE ------------------
function assignTypeColors() {
  let palette = [
    color(139, 69, 19),
    color(160, 82, 45),
    color(205, 133, 63),
    color(222, 184, 135),
    color(128, 128, 128),
    color(210, 180, 140),
    color(112, 128, 144)
  ];
  for (let i = 0; i < volcanoTypes.length; i++) {
    typeColors[volcanoTypes[i]] = palette[i % palette.length];
  }
}

// ------------------ WINDOW RESIZE ------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
