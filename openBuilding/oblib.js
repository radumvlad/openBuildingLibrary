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
//# sourceMappingURL=oblib.js.map
