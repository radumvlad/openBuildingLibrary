var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var buildingList = new Array();

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

var Building = (function () {
    function Building(str) {
        buildingList.push(this);
        this.canvas = document.getElementById(str);

        this.canvas['b_id'] = buildingList.length - 1;

        this.moving = false;
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
        } else {
            //IE 8-
            this.canvas.attachEvent('mousedown', Building.startMoving);
            this.canvas.attachEvent('mousemove', Building.moveFrame);
            this.canvas.attachEvent('mouseup', Building.endMoving);
            this.canvas.attachEvent("onmousewheel", Building.zoomFrame);
        }

        this.redraw();
    }
    Building.prototype.addObject = function (json) {
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
    };

    Building.prototype.deleteObject = function (i) {
        this.objects.splice(i, 1);
    };

    Building.prototype.setInitialObjects = function (json) {
        for (var i = 0; i < json.length; i++)
            this.addObject(json[i]);

        this.redraw();
    };

    Building.prototype.redraw = function () {
        this.clear();
        if (this.showGrid)
            this.drawGrid();

        this.drawObjects();
    };

    Building.prototype.drawGrid = function () {
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
    };

    Building.prototype.clear = function () {
        var ctx = this.canvas.getContext("2d");
        ctx.beginPath();
        ctx.clearRect(0, 0, this.width, this.height);
    };

    Building.prototype.drawObjects = function () {
        for (var i = 0; i < this.objects.length; i++)
            this.objects[i].draw(this.canvas, this.frame, this.scaleFactor);
    };

    Building.zoomFrame = function (event) {
        var building = buildingList[this['b_id']];

        var e = window.event || event;
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
    };

    Building.moveFrame = function (event) {
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
    };

    Building.startMoving = function (event) {
        var building = buildingList[this['b_id']];
        building.moving = true;
        building.initialX = event.clientX;
        building.initialY = event.clientY;
    };

    Building.endMoving = function (event) {
        var building = buildingList[this['b_id']];
        building.moving = false;
    };

    Building.prototype.toJson = function () {
        var obj = new Array();
        for (var i = 0; i < this.objects.length; i++)
            obj.push(this.objects[i].getObject());

        return JSON.stringify(obj);
    };
    return Building;
})();

var Item = (function () {
    function Item() {
        this.info = { x1: 0, x2: 0, y1: 0, y2: 0 };
    }
    return Item;
})();

var Wall = (function (_super) {
    __extends(Wall, _super);
    function Wall(json) {
        _super.call(this);
        this.info.x1 = json.info.x1;
        this.info.x2 = json.info.x2;
        this.info.y1 = json.info.y1;
        this.info.y2 = json.info.y2;
        this.kind = "wall";
    }
    Wall.prototype.draw = function (canvas, frame, scaleFactor) {
        var x1 = (this.info.x1 - frame.X1) * scaleFactor;
        var x2 = (this.info.x2 - frame.X1) * scaleFactor;
        var y1 = (this.info.y1 - frame.Y1) * scaleFactor;
        var y2 = (this.info.y2 - frame.Y1) * scaleFactor;

        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    Wall.prototype.getObject = function () {
        return new Object({ kind: "wall", info: { x1: this.info.x1, x2: this.info.x2, y1: this.info.y1, y2: this.info.y2 } });
    };
    return Wall;
})(Item);

var Door = (function (_super) {
    __extends(Door, _super);
    function Door(json) {
        _super.call(this);
        this.info.x1 = json.info.x;
        this.info.y1 = json.info.y;
        this.kind = "door";
        this.type = json.type;
        this.angle = json.angle;
    }
    Door.prototype.draw = function (canvas, frame, scaleFactor) {
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
    };

    Door.prototype.getObject = function () {
        return new Object({ kind: "door", info: { x: this.info.x1, y: this.info.y1 }, type: this.type, angle: this.angle });
    };
    return Door;
})(Item);

var Stair = (function (_super) {
    __extends(Stair, _super);
    function Stair(json) {
        _super.call(this);
        this.info.x1 = json.info.x;
        this.info.y1 = json.info.y;
        this.kind = "stair";
        this.type = json.type;
    }
    Stair.prototype.draw = function (canvas, frame, scaleFactor) {
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
    };

    Stair.prototype.getObject = function () {
        return new Object({ kind: "stair", info: { x: this.info.x1, y: this.info.y1 }, type: this.type });
    };
    return Stair;
})(Item);

var Label = (function (_super) {
    __extends(Label, _super);
    function Label(json) {
        _super.call(this);
        this.info.x1 = json.info.x;
        this.info.y1 = json.info.y;
        this.kind = "label";
        this.text = json.text;
    }
    Label.prototype.draw = function (canvas, frame, scaleFactor) {
        var ctx = canvas.getContext("2d");

        ctx.beginPath();

        var x, y;
        x = (this.info.x1 - frame.X1) * scaleFactor;
        y = (this.info.y1 - frame.Y1) * scaleFactor;

        ctx.font = scaleFactor / 2 + "px Georgia";

        ctx.fillText(this.text, x, y);
    };

    Label.prototype.getObject = function () {
        return new Object({ kind: "label", info: { x: this.info.x1, y: this.info.y1 }, text: this.text });
    };
    return Label;
})(Item);
//# sourceMappingURL=app.js.map
