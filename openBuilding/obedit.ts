/// <reference path="obview.ts"/>
var myEditableBuilding: EditableBuilding;



//moduri: select, move, add, eraser,
//actiuni: select, move, add each, erase, zoom in, zoom out 
class EditableBuilding extends Building {
    mode: string;
    selectedObject;
    selectedEdge: number;
    initialSelectX: number;
    initialSelectY: number;
    newObject;

    constructor() {
        super("editCanvas", true);
        myEditableBuilding = this;
        this.mode = "move";
        this.showGrid = true;
        this.selectedObject = null;


        if (this.canvas.addEventListener) {
            this.canvas.addEventListener('mousedown', EditableBuilding.mouse_down, false);
            this.canvas.addEventListener('mousemove', EditableBuilding.mouse_move, false);
            this.canvas.addEventListener('mouseup', EditableBuilding.mouse_up, false);

            this.canvas.addEventListener("mousewheel", EditableBuilding.scroll, false);
            //FF
            this.canvas.addEventListener("DOMMouseScroll", EditableBuilding.scroll, false);
        }

        this.redraw();
    }

    selectObject(X, Y) {
        this.moving = true;
        var it = -1;

        for (var i = this.objects.length - 1; i >= 0; i--) {

            var x1 = (this.objects[i].info.x1 - this.frame.X1) * this.scaleFactor;
            var x2 = (this.objects[i].info.x2 - this.frame.X1) * this.scaleFactor;
            var y1 = (this.objects[i].info.y1 - this.frame.Y1) * this.scaleFactor;
            var y2 = (this.objects[i].info.y2 - this.frame.Y1) * this.scaleFactor;

            if (this.objects[i].kind == "wall") {
                if (BasicGeometry.distPtoP(X, Y, x1, y1) < 10) {
                    it = i;
                    this.selectedEdge = 1;
                    break;
                }
                else if (BasicGeometry.distPtoP(X, Y, x2, y2) < 10) {
                    it = i;
                    this.selectedEdge = 2;
                    break;
                }
                else if (BasicGeometry.distPtoSeg(X, Y, x1, y1, x2, y2) < 7) {
                    it = i;
                    this.selectedEdge = 0;
                    this.initialSelectX = X;
                    this.initialSelectY = Y;
                    break;
                }
            }
            else if (BasicGeometry.isPrettyClose(this.objects[i], X - x1, Y - y1)) {
                it = i;
                break;
            }
        }

        if (it != -1) {
            this.selectedObject = this.objects[it];
            this.deleteObject(it);
        }
    }

    moveObject(X, Y) {
        if (this.moving == true && this.selectedObject) {
            if (this.selectedObject.kind == "wall") {
                this.moveWall(X, Y, this.selectedEdge);
            }
            else {
                this.selectedObject.info.x1 = X / this.scaleFactor + this.frame.X1;
                this.selectedObject.info.y1 = Y / this.scaleFactor + this.frame.Y1;
            }
            this.redraw();
        }
    }

    moveWall(X, Y, edge) {

        if (edge == 1) {
            this.selectedObject.info.x1 = Math.round(X / this.scaleFactor + this.frame.X1);
            this.selectedObject.info.y1 = Math.round(Y / this.scaleFactor + this.frame.Y1);
        }
        else if (edge == 2) {
            this.selectedObject.info.x2 = Math.round(X / this.scaleFactor + this.frame.X1);
            this.selectedObject.info.y2 = Math.round(Y / this.scaleFactor + this.frame.Y1);
        }
        else {
            if (((X - this.initialSelectX) / this.scaleFactor) >= 1 || ((X - this.initialSelectX) / this.scaleFactor) <= -1) {
                this.selectedObject.info.x1 = this.selectedObject.info.x1 + Math.round((X - this.initialSelectX) / this.scaleFactor);
                this.selectedObject.info.x2 = this.selectedObject.info.x2 + Math.round((X - this.initialSelectX) / this.scaleFactor);

                this.initialSelectX = X;
            }


            if (((Y - this.initialSelectY) / this.scaleFactor) > 1 || ((Y - this.initialSelectY) / this.scaleFactor) < -1) {
                this.selectedObject.info.y1 = this.selectedObject.info.y1 + Math.round((Y - this.initialSelectY) / this.scaleFactor);
                this.selectedObject.info.y2 = this.selectedObject.info.y2 + Math.round((Y - this.initialSelectY) / this.scaleFactor);

                this.initialSelectY = Y;
            }


        }
    }

    clearObject() {
        this.moving = false;
        if (this.selectedObject) {
            this.objects.push(this.selectedObject);
            this.selectedObject = undefined;
            this.selectedEdge = undefined;
        }
    }

    startErasing() {
        this.moving = true;
    }

    endErasing() {
        this.moving = false;
    }

    whileErasing(X, Y) {
        if (this.moving) {
            var it = -1;

            for (var i = this.objects.length - 1; i >= 0; i--) {

                var x1 = (this.objects[i].info.x1 - this.frame.X1) * this.scaleFactor;
                var x2 = (this.objects[i].info.x2 - this.frame.X1) * this.scaleFactor;
                var y1 = (this.objects[i].info.y1 - this.frame.Y1) * this.scaleFactor;
                var y2 = (this.objects[i].info.y2 - this.frame.Y1) * this.scaleFactor;

                if (this.objects[i].kind == "wall" && (BasicGeometry.distPtoSeg(X, Y, x1, y1, x2, y2) < 7)) {
                    it = i;
                    break;

                }
                else if (BasicGeometry.isPrettyClose(this.objects[i], X - x1, Y - y1)) {
                    it = i;
                    break;
                }
            }

            if (it != -1) {
                this.deleteObject(it);
            }

            this.redraw();
        }
    }

    addNewObject(X, Y) {


        if (this.newObject.kind == "wall") {
            this.newObject.info.x1 = Math.round(X / this.scaleFactor + this.frame.X1);
            this.newObject.info.y1 = Math.round(Y / this.scaleFactor + this.frame.Y1);

            this.newObject.info.x2 = Math.round(X / this.scaleFactor + this.frame.X1) + 2;
            this.newObject.info.y2 = Math.round(Y / this.scaleFactor + this.frame.Y1) + 2;
        }
        else {
            this.newObject.info.x1 = X / this.scaleFactor + this.frame.X1;
            this.newObject.info.y1 = Y / this.scaleFactor + this.frame.Y1;
        }

        this.objects.push(this.newObject);
        this.redraw();
    }

    redraw() {
        this.clear();

        if (this.showGrid)
            this.drawGrid();

        this.drawObjects();

        if (this.selectedObject)
            this.selectedObject.draw(this.canvas, this.frame, this.scaleFactor);
    }

    static mouse_down(event) {
        //due to offsetX not working in ff
        var x = event.clientX - myEditableBuilding.canvas.getBoundingClientRect().left;
        var y = event.clientY - myEditableBuilding.canvas.getBoundingClientRect().top;

        if (myEditableBuilding.mode == "move") {
            myEditableBuilding.startMovingFrame(x, y);
        }
        else if (myEditableBuilding.mode == "select") {
            myEditableBuilding.selectObject(x, y);
        }
        else if (myEditableBuilding.mode == "add") {
            //nothing here :(
        }
        else if (myEditableBuilding.mode == "erase") {
            myEditableBuilding.startErasing();
        }
    }

    static mouse_up(event) {
        //due to offsetX not working in ff
        var x = event.clientX - myEditableBuilding.canvas.getBoundingClientRect().left;
        var y = event.clientY - myEditableBuilding.canvas.getBoundingClientRect().top;

        if (myEditableBuilding.mode == "move") {
            myEditableBuilding.endMovingFrame();
        }
        else if (myEditableBuilding.mode == "select") {
            myEditableBuilding.clearObject();
        }
        else if (myEditableBuilding.mode == "add") {
            myEditableBuilding.addNewObject(x, y);
        }
        else if (myEditableBuilding.mode == "erase") {
            myEditableBuilding.endErasing();
        }
    }

    static mouse_move(event) {
        //due to offsetX not working in ff
        var x = event.clientX - myEditableBuilding.canvas.getBoundingClientRect().left;
        var y = event.clientY - myEditableBuilding.canvas.getBoundingClientRect().top;

        if (myEditableBuilding.mode == "move") {
            myEditableBuilding.moveFrame(x, y);
        }
        else if (myEditableBuilding.mode == "select") {
            myEditableBuilding.moveObject(x, y);
        }
        else if (myEditableBuilding.mode == "add") {
            //nothing here
        }
        else if (myEditableBuilding.mode == "erase") {
            myEditableBuilding.whileErasing(x, y);
        }

    }

    static scroll(event) {
        var e = window.event || event; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        e.preventDefault(); //so it will only action over the canvas and not on the window


        if (myEditableBuilding.mode == "move") {
            myEditableBuilding.zoomFrame(delta);
        }
        else if (myEditableBuilding.mode == "select") {
            myEditableBuilding.zoomFrame(delta);
        }
        else if (myEditableBuilding.mode == "add") {
            myEditableBuilding.zoomFrame(delta);
        }
        else if (myEditableBuilding.mode == "erase") {
            myEditableBuilding.zoomFrame(delta);
        }

    }

}

class BasicGeometry {
    static isPrettyClose(object, x, y) {
        if (x < object.width * 0.4 && x > - object.width * 0.4 && y < object.height * 0.4 && y > - object.height * 0.4)
            return true;
    }

    static distPtoP(x1, y1, x2, y2) {
        return Math.sqrt(BasicGeometry.distFormula(x1, y1, x2, y2));
    }

    static distFormula(x1, y1, x2, y2) {
        return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    }

    static distPtoSeg(x, y, x1, y1, x2, y2) {
        var l2 = BasicGeometry.distFormula(x1, y1, x2, y2);
        if (l2 == 0)
            return BasicGeometry.distPtoP(x, y, x1, y1);

        var t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / l2;
        if (t < 0)
            return BasicGeometry.distPtoP(x, y, x1, y1);
        if (t > 1)
            return BasicGeometry.distPtoP(x, y, x2, y2);
        return BasicGeometry.distPtoP(x, y, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }

}







