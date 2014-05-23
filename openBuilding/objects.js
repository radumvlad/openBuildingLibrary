var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Item = (function () {
    function Item() {
        this.info = { x1: 0, x2: 0, y1: 0, y2: 0 };
    }
    return Item;
})();

var Wall = (function (_super) {
    __extends(Wall, _super);
    function Wall(json) {
        if (typeof json === "undefined") { json = undefined; }
        _super.call(this);
        if (json != undefined) {
            this.info.x1 = json.info.x1;
            this.info.x2 = json.info.x2;
            this.info.y1 = json.info.y1;
            this.info.y2 = json.info.y2;
        }
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
        if (typeof json === "undefined") { json = undefined; }
        _super.call(this);
        if (json != undefined) {
            this.info.x1 = json.info.x;
            this.info.y1 = json.info.y;
            this.type = json.type;
            this.angle = json.angle;
        } else {
            this.angle = 0;
        }
        this.kind = "door";
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

        this.height = scaleFactor * 2;
        this.width = scaleFactor;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
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
        if (typeof json === "undefined") { json = undefined; }
        _super.call(this);
        if (json != undefined) {
            this.info.x1 = json.info.x;
            this.info.y1 = json.info.y;
            this.type = json.type;
        }

        this.kind = "stair";
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

        this.height = scaleFactor * 2;
        this.width = scaleFactor * 3;

        var x, y;
        x = (this.info.x1 - frame.X1) * scaleFactor;
        y = (this.info.y1 - frame.Y1) * scaleFactor;

        ctx.drawImage(img, x - this.width / 2, y - this.height / 2, this.width, this.height);
    };

    Stair.prototype.getObject = function () {
        return new Object({ kind: "stair", info: { x: this.info.x1, y: this.info.y1 }, type: this.type });
    };
    return Stair;
})(Item);

var Label = (function (_super) {
    __extends(Label, _super);
    function Label(json) {
        if (typeof json === "undefined") { json = undefined; }
        _super.call(this);
        if (json != undefined) {
            this.info.x1 = json.info.x;
            this.info.y1 = json.info.y;
            this.text = json.text;
        }
        this.kind = "label";
    }
    Label.prototype.draw = function (canvas, frame, scaleFactor) {
        var ctx = canvas.getContext("2d");

        ctx.beginPath();

        var x, y;
        x = (this.info.x1 - frame.X1) * scaleFactor;
        y = (this.info.y1 - frame.Y1) * scaleFactor;

        if (this.height != scaleFactor / 2) {
            this.height = scaleFactor / 2;
            ctx.font = this.height + "px Georgia";
        }

        this.width = ctx.measureText(this.text).width;

        ctx.fillText(this.text, x - this.width / 2, y + this.height / 2);
    };

    Label.prototype.getObject = function () {
        return new Object({ kind: "label", info: { x: this.info.x1, y: this.info.y1 }, text: this.text });
    };
    return Label;
})(Item);
//# sourceMappingURL=objects.js.map
