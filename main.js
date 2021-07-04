class Vector2 {
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
	static fromAngle(angle, size){
		return new Vector2(
			Math.sin(angle*2*Math.PI)*size,
			-Math.cos(angle*2*Math.PI)*size);
	}
	add(v){
		return new Vector2(this.x + v.x, this.y + v.y);
	}
	sub(v){
		return new Vector2(this.x - v.x, this.y - v.y);
	}
	copy(){
		return new Vector2(this.x, this.y);
	}
}

function clear(){
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	points = new Array();
}

function drawLine(v1, v2){
	ctx.moveTo(v1.x + canvas.width/2, v1.y + canvas.height/2);
	ctx.lineTo(v2.x + canvas.width/2, v2.y + canvas.height/2);
}

function drawMarks(num, size, width){
	ctx.lineWidth = width;
	ctx.beginPath();
	for(let i=0; i<num; ++i){
		drawLine(
			Vector2.fromAngle(i/num, CLOCK_RADIUS),
			Vector2.fromAngle(i/num, CLOCK_RADIUS-size));
	}
	ctx.stroke();
}

function drawHands(width){
	ctx.lineWidth = width;
	ctx.beginPath();
	if(mode & 4) drawLine(new Vector2(0,0), Vector2.fromAngle(hours/12, CLOCK_RADIUS*hourRatio));
	if(mode & 2) drawLine(new Vector2(0,0), Vector2.fromAngle(minutes/60, CLOCK_RADIUS*minRatio));
	if(mode & 1) drawLine(new Vector2(0,0), Vector2.fromAngle(seconds/60, CLOCK_RADIUS*secRatio));
	ctx.stroke();
}

function drawClock(){
	ctx.strokeStyle = clockColour;
	drawMarks(60, 6, 0.5);
	drawMarks(12, 12, 1);
	drawHands(2);
}

function drawBranch(point, dir, size, depth, ratio){
	let newPoint = point.add(Vector2.fromAngle(dir, size*ratio));

	drawLine(point, newPoint);
	drawFractal(newPoint, dir, size*ratio, depth-1);
}

function drawFractal(point, dir, size, depth){
	if(depth > 0){
		if(mode & 1) drawBranch(point, dir+seconds/60, size, depth, secRatio);
		if(mode & 2) drawBranch(point, dir+minutes/60, size, depth, minRatio);
		if(mode & 4) drawBranch(point, dir+hours/12, size, depth, hourRatio);
	}
	else {
		points.push(point);
	}
}

function drawPoints(){
	ctx.fillStyle = pointColour;
	for(let v of points){
		ctx.fillRect(v.x + canvas.width/2, v.y + canvas.height/2, 1, 1);
	}
}

function drawUI(){
	ctx.font = "1em sans-serif";
	ctx.fillStyle = '#ffffff';
	ctx.textAlign = 'left';
	ctx.fillText("[t] Toggle Time Mode", 10, 25)
	ctx.fillText("[m] Toggle Hands", 10, 50);
	ctx.fillText("[h] Toggle Hour Ratio", 10, 75);
	ctx.fillText("[s] Shift Colours", 10, 100);
	ctx.fillText("[-/+] Adjust Detail", 10, 125);

	ctx.textAlign = 'right';
	ctx.fillText("View Clock [c]", canvas.width-10, 25);
	ctx.fillText("View Branches [b]", canvas.width-10, 50);
	ctx.fillText("View Points [p]", canvas.width-10, 75);
	ctx.fillText("View UI [u]", canvas.width-10, 100);
}

function draw(){
	clear();
	ctx.strokeStyle = fractalColour;
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	drawFractal(new Vector2(0,0), 1, CLOCK_RADIUS, maxDepth);
	if(viewBranches) ctx.stroke();
	if(viewPoints) drawPoints();
	if(viewClock) drawClock();
	if(viewUI) drawUI();
}

function toggleMode(){
	switch(mode){
		case MODE_HMS: mode = MODE_HM; break;
		case MODE_HM: mode = MODE_MS; break;
		case MODE_MS:
			mode = MODE_HMS;
			if(maxDepth > 10) maxDepth = 10;
	}
}

function update(){
	let time = new Date();
	if(timeMode == TMODE_SW)
		time = new Date(time.getTime() - startTime.getTime());

	seconds = time.getSeconds() + time.getMilliseconds()*0.001;
	minutes = time.getMinutes() + seconds/60;
	hours = time.getHours() + minutes/60;
	if(shiftColours && ++colourCounter > 5){
		colourCounter -= 5;
		fractalColour = changeHue(fractalColour, 1);
		pointColour = changeHue(pointColour, 2);
	}
	draw();
}

//-----main function-----//
const CLOCK_RADIUS = 200;
const MODE_MS = 3;
const MODE_HM = 6;
const MODE_HMS = 7;
const TMODE_CLK = 0;
const TMODE_SW = 1;

let canvas = document.getElementById('demo');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.onresize = function(){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

document.onkeydown = function(event){
	switch(event.key){
		case 'c': viewClock = !viewClock; break;
		case 'b': viewBranches = !viewBranches; break;
		case 'p': viewPoints = !viewPoints; break;
		case 'u': viewUI = !viewUI; break;
		case 'h': hourRatio = (hourRatio == 0.5 ? 0.707 : 0.5); break;
		case 's': shiftColours = !shiftColours; break;
		case 'm': toggleMode(); break;
		case 't':
			timeMode = ++timeMode % 2;
			startTime = new Date();
			break;
		case '-': maxDepth = Math.max(1, maxDepth - 1); break;
		case '=': maxDepth = Math.min(15, maxDepth + 1); break;
	}
	depth = maxDepth;
}

let viewClock = true;
let viewBranches = true;
let viewPoints = true;
let viewUI = true;
let shiftColours = true;
let mode = MODE_MS;
let timeMode = TMODE_CLK;

let maxDepth = 13;
let secRatio = 0.707;
let minRatio = 0.707;
let hourRatio = 0.5;

let hours = 0;
let minutes = 0;
let seconds = 0;
let startTime = 0;

let clockColour = '#ffffff';
let fractalColour = '#660000';
let pointColour = '#990000';
let colourCounter = 0;

let points = new Array();
setInterval(update, 20);
