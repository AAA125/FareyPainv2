let r; 
let zoom = 1.0;
let translateX = 0;
let translateY = 0; 
let centerX, centerY; 
let pg; 
let slider; 
const scaleFactor = 2; // for scaling purposes
const MIN_STROKE_WEIGHT = 0.1;
// i AM VIBING EHEHE
//margins for the websitee ehehe 
const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 20;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
//graph theory letsgooo
class Graph { 
    numberNodes; 
    adjacencyMatrix; 
  
    constructor(numberNodes){ 
      this.numberNodes = numberNodes; 
  
      this.adjacencyMatrix = []; 
  
      for(let i = 0; i < this.numberNodes; i++){ 
        this.adjacencyMatrix[i] = new Array(this.numberNodes).fill(0); 
      }
  
    }
  
    addEdge(node1, node2){ 
  
      this.adjacencyMatrix[node1][node2] = 1; 
      this.adjacencyMatrix[node2][node1] = 1; 
  
    }
  
    getNeighboors(node){ 
       return this.adjacencyMatrix[node]; 
    }
  
    hasEdge(node1, node2){ 
  
      if(node1 >= 0 && node1 < this.numberNodes && node2 >= 0 && node2 < this.numberNodes){ 
        return this.adjacenMatrix[node1][node2] === 1 && this.adjacenMatrix[node2][node1] === 1; 
      }
  
      return false; 
    }
  
    removeEdge(node1, node2){ 
      if(node1 >= 0 && node1 < this.numberNodes && node2 >= 0 && node2 < this.numberNodes){ 
        this.adjacencyMatrix[node1][node2] = 0; 
        this.adjacencyMatrix[node2][node1] = 0; 
      }
  
    }
  
  }


class Point {
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
        this.updateFraction();
        this.updatePosition();
        this.neighbors = [];
    }

    value() {
        return this.denominator !== 0 ? this.numerator / this.denominator : Infinity;
    }

    angle() {
        if(this.denominator === 0 ){
            return PI;
        }
        else if(this.value()>1){
            return (1/this.value()+1)*PI/2 ;

        }
        else if(this.value()<=1 && this.value()>=0){    
            return (this.value())*PI/   2 ;
        }
        else if(this.value()<=-1){
            return (-1/this.value()+2)*PI/2 ;
        }
        else{
            return (this.value())*PI/2 ;
        }
    }
    updatePosition(){
        this.x = r * cos(this.angle());
        this.y = -r * sin(this.angle()); 
    }
    updateFraction(){

        if( this.numerator* this.denominator > 0){
            this.numerator = abs(this.numerator);
            this.denominator = abs(this.denominator);
        }
        else {
            this.numerator = -abs(this.numerator);
            this.denominator = abs(this.denominator);
        }
    }
    addNeighbor(point) {
        if (!this.neighbors.includes(point)) {
            this.neighbors.push(point);
        }
    }
    draw(pg) {
        let drawX = centerX + this.x * zoom;
        let drawY = centerY + this.y * zoom;
        pg.fill(255, 0, 0);
        pg.noStroke();
        pg.ellipse(drawX, drawY, max(1, 5 / zoom), max(1, 5 / zoom));

        // Draw fraction text
        let textX = centerX + (r + 20) * cos(this.angle()) * zoom;
        let textY = centerY - (r + 20) * sin(this.angle()) * zoom;
        pg.fill(0, 0, 0, 127);
        pg.textAlign(CENTER, CENTER);
        pg.textSize(12/ zoom);
        pg.text(`${this.numerator}/${this.denominator}`, textX, textY);
    }
    
    
}
class FareyDiagram{
    constructor(n){
        this.n = n; 
        this.points = []; 
        this.initializePoints();

    }
    initializePoints(){
        if (this.n === 1) {
            this.points = [new Point(0, 1), new Point(1, 1),new Point(1,0),new Point(-1,1)];
            this.points[0].addNeighbor(this.points[1]);
            this.points[1].addNeighbor(this.points[0]);
            this.points[1].addNeighbor(this.points[2]);
            this.points[2].addNeighbor(this.points[3]);
        } else if (this.n === 2) {
            this.points = [new Point(-1, 1), new Point(1, 1)];
            this.points[0].addNeighbor(this.points[1]);
            this.points[1].addNeighbor(this.points[0]);
        }
        
    }

    
    

    generate(iterations) {
        for (let i = 0; i < iterations; i++) {
            let newPoints = [];
            for (let j = 0; j < this.points.length; j++) {
                let current = this.points[j];
                let next = this.points[(j + 1) % this.points.length];
                
                newPoints.push(current);
                
                let a = current.numerator;
                let b = current.denominator;
                let c = next.numerator;
                let d = next.denominator;
                
                let newPoint = new Point(a + this.n * c, b + this.n * d);
                newPoints.push(newPoint);
                
                // Update graph structure
                current.addNeighbor(newPoint);
                next.addNeighbor(newPoint);
                newPoint.addNeighbor(current);
                newPoint.addNeighbor(next);
            }
            this.points = newPoints;
        }
    }
    
    draw(pg){
        pg.stroke(0);
        pg.strokeWeight(max(MIN_STROKE_WEIGHT, 1 / zoom));
        pg.noFill();
        pg.ellipse(centerX, centerY, r * 2, r * 2);

        for (let point of this.points) {
            point.draw(pg);
        }
    }
   
}

function setup() {
    let canvas = createCanvas(windowWidth - MARGIN_LEFT - MARGIN_RIGHT, windowHeight - MARGIN_TOP - MARGIN_BOTTOM);
    canvas.parent('sketch-holder');
    centerX = width / 2;
    centerY = height / 2;
    r = min(width, height) * 0.4;
    frameRate(60);
    
    pg = createGraphics(width, height);

    slider = createSlider(0, 7, 0);
    slider.position(MARGIN_LEFT, 10);
    slider.input(redrawFareyDiagram);

    select = createSelect();
    select.position(MARGIN_LEFT + slider.width + 20, 10);
    select.option('n = 1');
    select.option('n = 2');
    select.changed(updateFareyDiagram);

    updateFareyDiagram();
}

function updateFareyDiagram() {
    let n = select.value() === 'n = 2' ? 2 : 1;
    fareyDiagram = new FareyDiagram(n);
    redrawFareyDiagram();
}

function redrawFareyDiagram() {
    let iterations = slider.value();
    
    pg.clear();
    fareyDiagram.generate(iterations);
    fareyDiagram.draw(pg);
    //drawIntersections(pg);
}

function draw() {
    clear();
    push();
    translate(translateX + width / 2, translateY + height / 2);
    scale(zoom);
    translate(-width / 2, -height / 2);
    
    image(pg, 0, 0);
    pop();
}

function drawIntersections(pg) {
    for (let i = 0; i < fareyDiagram.points.length; i++) {
        let nextIndex = (i + 1) % fareyDiagram.points.length;
        let intersection = calculateIntersection(fareyDiagram.points[i], fareyDiagram.points[nextIndex]);

        if (intersection) {
            let distance = dist(intersection.x, intersection.y, fareyDiagram.points[i].x, fareyDiagram.points[i].y);
            pg.noFill();
            pg.stroke(0, 0, 0);
            pg.ellipse(intersection.x, intersection.y, distance * 2, distance * 2);
        }
    }
}

function calculateIntersection(p1, p2) {
    let m1 = cos(p1.angle) / sin(p1.angle);
    let m2 = cos(p2.angle) / sin(p2.angle);

    if (abs(sin(p1.angle)) < 1e-6 || abs(sin(p2.angle)) < 1e-6) {
        let x, y;
        if (abs(sin(p1.angle)) < 1e-6) {
            x = p1.x;
            y = m2 * (x - p2.x) + p2.y;
        } else {
            x = p2.x;
            y = m1 * (x - p1.x) + p1.y;
        }
        return {x, y};
    }

    let x = (p2.y - p1.y + m1 * p1.x - m2 * p2.x) / (m1 - m2);
    let y = m1 * (x - p1.x) + p1.y;

    return {x, y};
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
