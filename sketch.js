
let data;
let miniLat, miniLon, maxiLat, maxiLon;


function preload() {
  // put preload code here
  data = loadTable ("assets/data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // put setup code here


  let allLat=data.getColumn("Latitude");
  miniLat=min(allLat);
  maxiLat=max(allLat);

  let allLon = data.getColumn("Longitude");
  miniLon = min(allLon);
  maxiLon = max(allLon);

  console.log (miniLat, maxiLat);

}
function draw() {
  // put drawing code here
  background (10);

  for (let rownumber=0; rownumber<data.getRowCount(); rownumber++){
    console.log (rownumber);

    let lat = data.getNum(rownumber, "Latitude");
    let lon = data.getNum(rownumber, "Longitude");

    let x = map (lon, miniLon, maxiLon, 0, width);
    let y = map (lat, miniLat, maxiLat, height, 0);
    let radius =10;
    let d = dist(x, y, mouseX, mouseY);

    if (d<radius) {
    fill("red"); }


    if (d>radius) {
    fill("yellow"); }
    
    ellipse (x,y, radius*2);

    //calcolo la distanza 
   
  
  }


  }