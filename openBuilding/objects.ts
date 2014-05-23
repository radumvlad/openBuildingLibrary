
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
    height: number;
    width: number;
}

class Wall extends Item {

    constructor(json = undefined) {
        super();
        if (json != undefined) {
            this.info.x1 = json.info.x1;
            this.info.x2 = json.info.x2;
            this.info.y1 = json.info.y1;
            this.info.y2 = json.info.y2;
        }
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
        return new Object({ kind: "wall", info: { x1: this.info.x1, x2: this.info.x2, y1: this.info.y1, y2: this.info.y2 } });
    }
}

class Door extends Item {
    type: String;
    angle: number;


    constructor(json = undefined) {
        super();
        if (json != undefined) {
            this.info.x1 = json.info.x;
            this.info.y1 = json.info.y;
            this.type = json.type;
            this.angle = json.angle;
        }
        else {
            this.angle = 0;
        }
        this.kind = "door";
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

        this.height = scaleFactor * 2;
        this.width = scaleFactor;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(img, - this.width / 2, - this.height / 2, this.width, this.height);
        ctx.restore();
    }

    getObject() {
        return new Object({ kind: "door", info: { x: this.info.x1, y: this.info.y1 }, type: this.type, angle: this.angle });
    }
}

class Stair extends Item {
    type: string;

    constructor(json = undefined) {
        super();
        if (json != undefined) {
            this.info.x1 = json.info.x;
            this.info.y1 = json.info.y;
            this.type = json.type;
        }

        this.kind = "stair";
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

        this.height = scaleFactor * 2;
        this.width = scaleFactor * 3;


        var x, y;
        x = (this.info.x1 - frame.X1) * scaleFactor;
        y = (this.info.y1 - frame.Y1) * scaleFactor;


        ctx.drawImage(img, x - this.width / 2, y - this.height / 2, this.width, this.height);
    }

    getObject() {
        return new Object({ kind: "stair", info: { x: this.info.x1, y: this.info.y1 }, type: this.type });
    }
}

class Label extends Item {
    text: string;

    constructor(json = undefined) {
        super();
        if (json != undefined) {
            this.info.x1 = json.info.x;
            this.info.y1 = json.info.y;
            this.text = json.text;
        }
        this.kind = "label";
    }

    draw(canvas, frame, scaleFactor) {
        var ctx = canvas.getContext("2d");

        ctx.beginPath();

        var x: number, y: number;
        x = (this.info.x1 - frame.X1) * scaleFactor;
        y = (this.info.y1 - frame.Y1) * scaleFactor;

        if (this.height != scaleFactor / 2) {
            this.height = scaleFactor / 2;
            ctx.font = this.height + "px Georgia";
        }

        this.width = ctx.measureText(this.text).width;

        ctx.fillText(this.text, x - this.width / 2, y + this.height / 2);
    }

    getObject() {
        return new Object({ kind: "label", info: { x: this.info.x1, y: this.info.y1 }, text: this.text });
    }
}
