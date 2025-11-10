let volcanoData;
let worldImg;
let fontRegular;

let activeType = null;
let typeColors = {};
let volcanoTypes = [];

let hoveredVolcano = null; // vulcano più vicino al mouse

// PRELOAD
function preload() {
  volcanoData = loadTable("volcanoes-2025-10-27 - Es.3 - Original Data.csv", "csv", "header");
  worldImg = loadImage("World-map.svg");
  fontRegular = loadFont("https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf");
}

// SETUP
let volcanoDropdownDiv;
let volcanoDropdownList;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(fontRegular);
  textAlign(LEFT, CENTER);
  noStroke();

  let typeSet = new Set(volcanoData.getColumn("Type"));
  volcanoTypes = Array.from(typeSet).sort();
  assignTypeColors();

  createDropdown();
}

// DRAW
function draw() {
  background(255, 255, 230);

  drawTitle();
  drawFooter();
  drawLegendBox();

  let mapMargin = 20;
  let mapY = 130;
  let maxMapW = width - 2 * mapMargin;
  let maxMapH = height - mapY - mapMargin;
  let scaleFactor = min(maxMapW / worldImg.width, maxMapH / worldImg.height);
let mapW = worldImg.width * scaleFactor * 1;   
let mapH = worldImg.height * scaleFactor;
let mapX = (width - mapW) / 2;


  drawWorldMap(mapX, mapY, mapW, mapH);
  drawVolcanoes(mapX, mapY, mapW, mapH);
 
  
}

// TITLE & FOOTER
function drawTitle() {
  textAlign(RIGHT, CENTER);
  textSize(50);
  fill(50, 100, 150);
  text("Volcanoes of the World", width - 80, 50);
}

function drawFooter() {
  textAlign(CENTER, CENTER);
  textSize(12);
  fill(50);
  text("Chiara Buda — Assignment 2", width / 2, height - 20);
}

// MAP & VOLCANOES
function drawWorldMap(mapX, mapY, mapW, mapH) {
  imageMode(CORNER);
  image(worldImg, mapX, mapY, mapW, mapH);
}

function drawVolcanoes(mapX, mapY, mapW, mapH) {
  // reset hover
  hoveredVolcano = null;
  let closestDist = Infinity;

  //  trovare il vulcano più vicino al mouse (solo tra quelli visibili)
  for (let r = 0; r < volcanoData.getRowCount(); r++) {
    let row = volcanoData.getRow(r);
    let lat = float(row.get("Latitude"));
    let lon = float(row.get("Longitude"));
    let type = row.get("Type");
    let elev = float(row.get("Elevation (m)"));
    let name = row.get("Volcano Name") || "Unknown";

    if (activeType && type !== activeType) continue;

  
    let x = map(lon, -180, 180, mapX, mapX + mapW);
    let y = map(lat, 90, -90, mapY, mapY + mapH); 

    // dimensione marker basata sull'elevazione
    let size = map(elev, 0, 6000, 4, 30);

    let d = dist(mouseX, mouseY, x, y);
    // tolleranza di hover leggermente più ampia per facilitare l'interazione
    if (d < max(size, 8) && d < closestDist) {
      closestDist = d;
      hoveredVolcano = { name, type, elev, x, y, size };
    }
  }

  // sdisegna tutti i vulcani
  for (let r = 0; r < volcanoData.getRowCount(); r++) {
    let row = volcanoData.getRow(r);
    let lat = float(row.get("Latitude"));
    let lon = float(row.get("Longitude"));
    let type = row.get("Type");
    let elev = float(row.get("Elevation (m)"));
    let name = row.get("Volcano Name") || "Unknown";

    if (activeType && type !== activeType) continue;

    let x = map(lon, -180, 180, mapX, mapX + mapW);
    let y = map(lat, 90, -90, mapY, mapY + mapH);
  let size = map(elev, 0, 9000, 4, 50);
  let c = typeColors[type] || color(100);
  // rendi i punti con opacità ~70% (70% opacity)
  let alphaVal = 255 * 0.7; // 0-255 scale
  let cAlpha = color(red(c), green(c), blue(c), alphaVal);

  noStroke();
  fill(cAlpha);
  ellipse(x, y, size, size);

    // se il vulcano è hovered, disegna un bordo di evidenziazione
    if (hoveredVolcano && hoveredVolcano.name === name) {
      stroke(180, 30, 10);
      strokeWeight(2);
      fill(c);
      ellipse(x, y, size + 8, size + 8);
      noStroke();
    }
  }

  // tooltip / label del vulcano sotto il mouse
  if (hoveredVolcano) {
    drawTooltip(hoveredVolcano);
  }
}

// ------------------ TOOLTIP ------------------
function drawTooltip(volcano) {
  push();
  textFont(fontRegular);
  textSize(12);
  let padding = 8;
  let txtLines = [`${volcano.name}`, `${volcano.type}`, `${nf(volcano.elev, 0, 0)} m`];
  // calcola larghezza testo
  textAlign(LEFT, TOP);
  let tw = 0;
  for (let t of txtLines) {
    tw = max(tw, textWidth(t));
  }
  tw += padding * 2;
  let th = txtLines.length * 16 + padding * 2;

  // posizione iniziale: preferisci sopra a destra del punto
  let tx = volcano.x + 12;
  let ty = volcano.y - th - 12;

  // sanity checks: non uscire dallo schermo
  if (tx + tw > width - 8) tx = volcano.x - tw - 12;
  if (ty < 8) ty = volcano.y + 12;

  // box tooltip
  fill(255, 250, 240, 240);
  stroke(180);
  strokeWeight(1);
  rect(tx, ty, tw, th, 6);

  // testo
  noStroke();
  fill(20);
  for (let i = 0; i < txtLines.length; i++) {
    text(txtLines[i], tx + padding, ty + padding + i * 16);
  }

  // lineetta che collega al punto
  stroke(150, 300);
  strokeWeight(2);
  line(constrain(volcano.x, tx, tx + tw), constrain(volcano.y, ty, ty + th), volcano.x, volcano.y);

  pop();
}

//LEGEND
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
  text("Select a volcano type", boxX + 10, boxY + 10);
  text("or hover on the map to see details.", boxX + 10, boxY + 30);
  pop();
}

// DROPDOWN 
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
  volcanoDropdownList.position(45, 102 + 32);
  volcanoDropdownList.style('width', '220px');
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

// COLORI
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

// WINDOW RESIZE 
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // riposiziona dropdown manualmente 
  if (volcanoDropdownDiv) {
    volcanoDropdownDiv.position(45, 102);
    volcanoDropdownList.position(45, 102 + 32);
  }
}
