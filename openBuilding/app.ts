var buildingList: Array<Building> = new Array();

var exitDoorImg = new Image(20, 20); 
exitDoorImg.src = 'http://localhost:88/openBuilding/assets/img/exit.png';

var doorImg = new Image(20, 20); 
doorImg.src = 'http://localhost:88/openBuilding/assets/img/door.png';

var stairsUpImg = new Image(20, 20);
stairsUpImg.src = 'http://localhost:88/openBuilding/assets/img/scari_sus.png';

var stairsDownImg = new Image(20, 20);
stairsDownImg.src = 'http://localhost:88/openBuilding/assets/img/scari_jos.png';

var stairsImg = new Image(20, 20);
stairsImg.src = 'http://localhost:88/openBuilding/assets/img/scari_b.png';

class Building {
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    showGrid: boolean;
    scaleFactor: number;

    oldScaleFactor: number;
    MIN_SCALE_FACTOR: number;
    MAX_SCALE_FACTOR: number;

    initialX: number;
    initialY: number;
    moving: boolean;

    objects: any;

    frame: {
        X1: number;
        X2: number;
        Y1: number;
        Y2: number;
    };

    constructor(str: string) {

        buildingList.push(this);
        this.canvas = <HTMLCanvasElement> document.getElementById(str);
        
        this.canvas['b_id'] = buildingList.length - 1;

        this.moving = false
        this.showGrid = false;
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        this.scaleFactor = 20;
        this.MIN_SCALE_FACTOR = 5;
        this.MAX_SCALE_FACTOR = 100;

        this.frame = { X1: 0, X2: this.width / this.scaleFactor, Y1: 0, Y2: this.height / this.scaleFactor };

        this.objects = Array();

        if (this.canvas.addEventListener) {
            this.canvas.addEventListener('mousedown', Building.startMoving, false);
            this.canvas.addEventListener('mousemove', Building.moveFrame, false);
            this.canvas.addEventListener('mouseup', Building.endMoving, false);


            this.canvas.addEventListener("mousewheel", Building.zoomFrame, false);
            //FF
            this.canvas.addEventListener("DOMMouseScroll", Building.zoomFrame, false);
        }
        else {
            //IE 8-
            this.canvas.attachEvent('mousedown', Building.startMoving);
            this.canvas.attachEvent('mousemove', Building.moveFrame);
            this.canvas.attachEvent('mouseup', Building.endMoving);
            this.canvas.attachEvent("onmousewheel", Building.zoomFrame);
        }

        this.redraw();
    }

    addObject(json) {
        var obj;

        if (json.kind == "wall")
            obj = new Wall(json);
        else if (json.kind == "door")
            obj = new Door(json);
        else if (json.kind == "stair")
            obj = new Stair(json);
        else if (json.kind == "label")
            obj = new Label(json);

        this.objects.push(obj);
    }

    deleteObject(i) {
        this.objects.splice(i, 1);
    }

    setInitialObjects(json) {
        for (var i = 0; i < json.length; i++)
            this.addObject(json[i]);

        this.redraw();
    }

    redraw() {
        this.clear();
        if(this.showGrid)
            this.drawGrid();

        this.drawObjects();
    }

    private drawGrid() {
        var iterator;
        if (this.frame.X1 > 0)
            iterator = this.scaleFactor - ((this.frame.X1 * this.scaleFactor) % this.scaleFactor);
        else
            iterator = ((this.frame.X1 * this.scaleFactor) % this.scaleFactor) * (-1);


        var ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;


        for (var i = iterator; i < this.width; i += this.scaleFactor) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.height);
            ctx.stroke();
        }


        if (this.frame.Y1 > 0)
            iterator = this.scaleFactor - ((this.frame.Y1 * this.scaleFactor) % this.scaleFactor);
        else
            iterator = ((this.frame.Y1 * this.scaleFactor) % this.scaleFactor) * (-1);


        ctx.beginPath();


        for (var i = iterator; i < this.height; i += this.scaleFactor) {
            ctx.moveTo(0, i);
            ctx.lineTo(this.width, i);
            ctx.stroke();
        }
    }

    private clear() {

        var ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        ctx.clearRect(0, 0, this.width, this.height);
    }

    private drawObjects() {
        for (var i = 0; i < this.objects.length; i++)
            this.objects[i].draw(this.canvas, this.frame, this.scaleFactor);
    }

    static zoomFrame(event) {
        var building = buildingList[this['b_id']];

        var e = window.event || event; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        e.preventDefault(); //so it will only action over the canvas and not on the window

        building.oldScaleFactor = building.scaleFactor;

        if (building.scaleFactor + delta * 3 > building.MIN_SCALE_FACTOR && building.scaleFactor + delta * 3 < building.MAX_SCALE_FACTOR)
            building.scaleFactor = building.scaleFactor + delta * 3;

        if (building.oldScaleFactor != building.scaleFactor) {
            //new values for frame
            var ratioX = building.width / building.oldScaleFactor - building.width / building.scaleFactor;
            var ratioY = building.height / building.oldScaleFactor - building.height / building.scaleFactor;

            building.frame.X1 = building.frame.X1 + ratioX / 2;
            building.frame.X2 = building.frame.X2 - ratioX / 2;
            building.frame.Y1 = building.frame.Y1 + ratioY / 2;
            building.frame.Y2 = building.frame.Y2 - ratioY / 2;
        }

        building.redraw();
    }

    static moveFrame(event) {
        var building = buildingList[this['b_id']];
        if (building.moving == true) {
            building.frame.X1 = building.frame.X1 + (building.initialX - event.clientX) / building.scaleFactor;
            building.frame.X2 = building.frame.X2 + (building.initialX - event.clientX) / building.scaleFactor;
            building.frame.Y1 = building.frame.Y1 + (building.initialY - event.clientY) / building.scaleFactor;
            building.frame.Y2 = building.frame.Y2 + (building.initialY - event.clientY) / building.scaleFactor;

            building.initialX = event.clientX;
            building.initialY = event.clientY;

            building.redraw();            
        }
    }

    static startMoving(event) {
        var building = buildingList[this['b_id']];
        building.moving = true;
        building.initialX = event.clientX;
        building.initialY = event.clientY;
    }

    static endMoving(event) {
        var building = buildingList[this['b_id']];
        building.moving = false;
    }

    toJson() {
        var obj = new Array();
        for (var i = 0; i < this.objects.length; i++)
            obj.push(this.objects[i].getObject())

        return JSON.stringify(obj);
    }
}

class Item {
    constructor() {
        this.info = { x1: 0, x2: 0, y1: 0, y2: 0 };
    }
    info: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };

    kind: string;
}

class Wall extends Item {

    constructor(json) {
        super();
        this.info.x1 = json.info.x1;
        this.info.x2 = json.info.x2;
        this.info.y1 = json.info.y1;
        this.info.y2 = json.info.y2;
        this.kind = "wall";
    }

    draw(canvas, frame, scaleFactor) {
        var x1: number = (this.info.x1 - frame.X1) * scaleFactor;
        var x2: number = (this.info.x2 - frame.X1) * scaleFactor;
        var y1: number = (this.info.y1 - frame.Y1) * scaleFactor;
        var y2: number = (this.info.y2 - frame.Y1) * scaleFactor;

        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    getObject() {
        return new Object({ kind: "wall", info: { x1: this.info.x1, x2: this.info.x2, y1:this.info.y1, y2:this.info.y2}});
    }
}

class Door extends Item {
    type: String;
    angle: number;


    constructor(json) {
        super();
        this.info.x1 = json.info.x;
        this.info.y1 = json.info.y;
        this.kind = "door";
        this.type = json.type;
        this.angle = json.angle;
    }

    draw(canvas, frame, scaleFactor) {

        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        var img;

        if (this.type == "exit")
            img = exitDoorImg;
        else
            img = doorImg;

        var x, y;
        x = (this.info.x1 - frame.X1) * scaleFactor;
        y = (this.info.y1 - frame.Y1) * scaleFactor;



        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(img, -(scaleFactor / 2), -scaleFactor, scaleFactor, scaleFactor * 2);
        ctx.restore();
    }

    getObject() {
        return new Object({ kind: "door", info: { x: this.info.x1, y: this.info.y1}, type: this.type, angle: this.angle });
    }
}

class Stair extends Item {
    type: string;

    constructor(json) {
        super();
        this.info.x1 = json.info.x;
        this.info.y1 = json.info.y;
        this.kind = "stair";
        this.type = json.type;
    }

    draw(canvas, frame, scaleFactor) {

        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        var img;

        if (this.type == "up")
            img = stairsUpImg;
        else if (this.type == "down")
            img = stairsDownImg;
        else if (this.type == "both")
            img = stairsImg;


        var x, y;
        x = (this.info.x1 - frame.X1) * scaleFactor;
        y = (this.info.y1 - frame.Y1) * scaleFactor;

        ctx.drawImage(img, x - scaleFactor, y - 1.5 * scaleFactor, scaleFactor * 2, scaleFactor * 3);
    }

    getObject() {
        return new Object({ kind: "stair", info: { x: this.info.x1, y: this.info.y1 }, type: this.type});
    }
}

class Label extends Item {
    text: string;

    constructor(json) {
        super();
        this.info.x1 = json.info.x;
        this.info.y1 = json.info.y;
        this.kind = "label";
        this.text = json.text;
    }

    draw(canvas, frame, scaleFactor) {
        var ctx = canvas.getContext("2d");

        ctx.beginPath();

        var x: number, y: number;
        x = (this.info.x1 - frame.X1) * scaleFactor;
        y = (this.info.y1 - frame.Y1) * scaleFactor;

        ctx.font = scaleFactor / 2 + "px Georgia";

        ctx.fillText(this.text, x, y);
    }

    getObject() {
        return new Object({ kind: "label", info: { x: this.info.x1, y: this.info.y1 }, text: this.text });
    }
}