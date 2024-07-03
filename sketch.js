let r;
let zoom = 1.0;
let translateX = 0;
let translateY = 0;
let centerX, centerY;
let pg;
let slider;
const scaleFactor = 2;//to increase or reduce
const MIN_STROKE_WEIGHT = 0.1;

// margin for website 
const MARGIN_TOP = 50; 
const MARGIN_BOTTOM = 20; 
const MARGIN_LEFT = 20; 
const MARGIN_RIGHT = 20;  
function setup() {
  let canvas = createCanvas(windowWidth - MARGIN_LEFT - MARGIN_RIGHT, windowHeight - MARGIN_TOP - MARGIN_BOTTOM, SVG);
  canvas.parent('sketch-holder'); // Assuming you have a div with id 'sketch-holder' in your HTML
  centerX = width / 2;
  centerY = height / 2;
  r = min(width, height) * 0.4;
  frameRate(60);
  
  // Create the p5.Graphics object with SVG
  pg = createGraphics(width, height, SVG);

  // Create the slider
  slider = createSlider(0, 20, 10);
  slider.position(MARGIN_LEFT, 10);
  slider.input(redrawFareyDiagram);

  // Draw the Farey diagrams on the p5.Graphics object
  redrawFareyDiagram();
}

function redrawFareyDiagram() {
  let iterations = slider.value();

  // Clear the p5.Graphics object
  pg.clear();
  pg.stroke(0);
  pg.strokeWeight(max(MIN_STROKE_WEIGHT, 1 / zoom));
  pg.noFill();
  pg.ellipse(centerX, centerY, r * 2, r * 2);
  
  for(let k = 0; k < iterations; k++){
    FareyPoints(k, pg);
  }
}
function draw() {
  clear();
  push();
  translate(translateX + width / 2, translateY + height / 2);
  scale(zoom);
  translate(-width / 2, -height / 2);
  
  // Display the p5.Graphics object
  image(pg, 0, 0);

  pop();
}


function mouseWheel(event) {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      let e = event.delta;
      let zoomFactor = 0.01;
      let newZoom = zoom * (1 - e * zoomFactor);
      
      if (newZoom > 0.01 && newZoom < 1000) {
          let mouseXScaled = (mouseX - translateX) / zoom;
          let mouseYScaled = (mouseY - translateY) / zoom;
          zoom = newZoom;
          translateX -= mouseXScaled * (zoom - newZoom);
          translateY -= mouseYScaled * (zoom - newZoom);
          
          redrawFareyDiagram();
      }
      
      return false;
  }
}
function windowResized() {
  resizeCanvas(windowWidth - MARGIN_LEFT - MARGIN_RIGHT, windowHeight - MARGIN_TOP - MARGIN_BOTTOM);
  centerX = width / 2;
  centerY = height / 2;
  r = min(width, height) * 0.4;
  redrawFareyDiagram();
}

function mouseDragged() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      translateX += mouseX - pmouseX;
      translateY += mouseY - pmouseY;
  }
}
function FareyPoints(n, pg) {
  let P = Farey(n);
  let strokeW = max(MIN_STROKE_WEIGHT, 1 / zoom);
  pg.strokeWeight(strokeW);

  // Draw the points on the circle
  for (let i = 0; i < P.length; i++) {
    let x = centerX + r * cos(P[i]);
    let y = centerY - r * sin(P[i]);
    pg.fill(255,0,0);
    pg.noStroke();
    pg.ellipse(x, y, max(1, 5 / zoom), max(1, 5 / zoom));
  }

  // Calculate and draw intersections and new circles
  for (let i = 0; i < P.length; i++) {
    let nextIndex = (i + 1) % P.length;
    let angle1 = P[i];
    let angle2 = P[nextIndex];

    let intersection = calculateIntersection(angle1, angle2);

    if (!isNaN(intersection[0]) && !isNaN(intersection[1])) {
      // Calculate distance to one of the original Farey circle points
      let x1 = centerX + r * cos(angle1);
      let y1 = centerY - r * sin(angle1);
      let distance = dist(intersection[0], intersection[1], x1, y1);

      // Draw new circle
      pg.noFill();
      pg.stroke(0, 0, 0);
      pg.ellipse(intersection[0], intersection[1], distance * 2, distance * 2);
    }
  }
}
function calculateIntersection(angle1, angle2) {
  // Calculate points on the circle
  let x1 = centerX + r * cos(angle1);
  let y1 = centerY - r * sin(angle1);
  let x2 = centerX + r * cos(angle2);
  let y2 = centerY - r * sin(angle2);

  // Calculate tangent slopes
  let m1 = cos(angle1) / sin(angle1);
  let m2 = cos(angle2) / sin(angle2);

  // Handle vertical tangents
  if (abs(sin(angle1)) < 1e-6 || abs(sin(angle2)) < 1e-6) {
    let x, y;
    if (abs(sin(angle1)) < 1e-6) {
      x = x1;
      y = m2 * (x - x2) + y2;
    } else {
      x = x2;
      y = m1 * (x - x1) + y1;
    }
    return [x, y];
  }

  // Calculate intersection
  let x = (y2 - y1 + m1 * x1 - m2 * x2) / (m1 - m2);
  let y = m1 * (x - x1) + y1;

  return [x, y];
}

function Farey(n) {
  let equi = [];
  if (n == 0) {
    for (let i = 0; i < 4; i++) {
      equi.push((i * PI) / 2);
    }
  } else {
    let prevFarey = Farey(n - 1);
    for (let j = 0; j < prevFarey.length - 1; j++) {
      equi.push(prevFarey[j]);
      equi.push((prevFarey[j] + prevFarey[j + 1]) / 2);
    }
    equi.push(prevFarey[prevFarey.length - 1]);
    equi.push((prevFarey[prevFarey.length - 1] + 2 * PI) / 2);
  }
  return equi;
}