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
    function Building(str, extended) {
        if (typeof extended === "undefined") { extended = false; }
        //adding the building in the map with the canvas-id key. that means if there are more that one canvas they should have unique ids(a html decent clear fact, also)
        buildingList[str] = this;

        this.canvas = document.getElementById(str);
        this.moving = false;
        this.showGrid = false;
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        this.scaleFactor = 20;
        this.MIN_SCALE_FACTOR = 5;
        this.MAX_SCALE_FACTOR = 100;

        this.frame = { X1: 0, X2: this.width / this.scaleFactor, Y1: 0, Y2: this.height / this.scaleFactor };

        this.objects = Array();

        if (extended == false) {
            if (this.canvas.addEventListener) {
                this.canvas.addEventListener('mousedown', Building.mouse_down, false);
                this.canvas.addEventListener('mousemove', Building.mouse_move, false);
                this.canvas.addEventListener('mouseup', Building.mouse_up, false);

                this.canvas.addEventListener("mousewheel", Building.scroll, false);

                //FF
                this.canvas.addEventListener("DOMMouseScroll", Building.scroll, false);
            }
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

    Building.prototype.toJson = function () {
        var obj = new Array();
        for (var i = 0; i < this.objects.length; i++)
            obj.push(this.objects[i].getObject());

        return JSON.stringify(obj);
    };

    Building.prototype.zoomFrame = function (delta) {
        this.oldScaleFactor = this.scaleFactor;

        if (this.scaleFactor + delta * 3 > this.MIN_SCALE_FACTOR && this.scaleFactor + delta * 3 < this.MAX_SCALE_FACTOR)
            this.scaleFactor = this.scaleFactor + delta * 3;

        if (this.oldScaleFactor != this.scaleFactor) {
            //new values for frame
            var ratioX = this.width / this.oldScaleFactor - this.width / this.scaleFactor;
            var ratioY = this.height / this.oldScaleFactor - this.height / this.scaleFactor;

            this.frame.X1 = this.frame.X1 + ratioX / 2;
            this.frame.X2 = this.frame.X2 - ratioX / 2;
            this.frame.Y1 = this.frame.Y1 + ratioY / 2;
            this.frame.Y2 = this.frame.Y2 - ratioY / 2;

            this.redraw();
        }
    };

    Building.prototype.moveFrame = function (X, Y) {
        if (this.moving == true) {
            this.frame.X1 = this.frame.X1 + (this.initialX - X) / this.scaleFactor;
            this.frame.X2 = this.frame.X2 + (this.initialX - X) / this.scaleFactor;
            this.frame.Y1 = this.frame.Y1 + (this.initialY - Y) / this.scaleFactor;
            this.frame.Y2 = this.frame.Y2 + (this.initialY - Y) / this.scaleFactor;

            this.initialX = X;
            this.initialY = Y;

            this.redraw();
        }
    };

    Building.prototype.startMovingFrame = function (X, Y) {
        this.moving = true;
        this.initialX = X;
        this.initialY = Y;
    };

    Building.prototype.endMovingFrame = function () {
        this.moving = false;
    };

    Building.scroll = function (event) {
        var building = buildingList[this['id']];

        var e = window.event || event;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        e.preventDefault(); //so it will only action over the canvas and not on the window

        building.zoomFrame(delta);
    };

    Building.mouse_down = function (event) {
        var building = buildingList[this['id']];
        building.startMovingFrame(event.clientX, event.clientY);
    };

    Building.mouse_up = function (event) {
        var building = buildingList[this['id']];
        building.endMovingFrame();
    };

    Building.mouse_move = function (event) {
        var building = buildingList[this['id']];
        building.moveFrame(event.clientX, event.clientY);
    };
    return Building;
})();
//# sourceMappingURL=obview.js.map
