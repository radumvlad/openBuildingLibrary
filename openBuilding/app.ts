/// <reference path="objects.ts"/>
/// <reference path="obview.ts"/>



function init() {
    var data, b;

    data = JSON.parse('[{ "kind": "wall", "info": { "x1": 1, "y1": 1, "x2": 5, "y2": 1 } }, { "kind": "wall", "info": { "x1": 5, "y1": 1, "x2": 5, "y2": 5 } }, { "kind": "wall", "info": { "x1": 5, "y1": 5, "x2": 1, "y2": 5 } }, { "kind": "wall", "info": { "x1": 1, "y1": 5, "x2": 1, "y2": 1 } }, {"kind": "stair", "info": {"x": 10, "y": 10}, "type": "both"}, {"kind": "door", "info": {"x": 8, "y": 2}, "angle": 0, "type": "normal"}, {"kind": "label", "info": {"x": 2, "y": 2}, "text": "zzz"}]');

    b = new EditableBuilding();
    b.setInitialObjects(data);

}

function change(action) {
    if (action == "select") {
        myEditableBuilding.mode = "select";
    }
    else if (action == "move") {
        myEditableBuilding.mode = "move";
    }
    else if (action == "erase") {
        myEditableBuilding.mode = "erase";
    }
    else if (action == "add_wall") {
        myEditableBuilding.mode = "add";
        myEditableBuilding.newObject = new Wall();
    }
    else if (action == "add_sup") {
        myEditableBuilding.mode = "add";
        myEditableBuilding.newObject = new Stair();
        myEditableBuilding.newObject.type = "up";
    }
    else if (action == "add_sdown") {
        myEditableBuilding.mode = "add";
        myEditableBuilding.newObject = new Stair();
        myEditableBuilding.newObject.type = "down";
    }
    else if (action == "add_sboth") {
        myEditableBuilding.mode = "add";
        myEditableBuilding.newObject = new Stair();
        myEditableBuilding.newObject.type = "both";
    }
    else if (action == "add_door") {
        myEditableBuilding.mode = "add";
        myEditableBuilding.newObject = new Door();
        myEditableBuilding.newObject.type = "normal";
    }
    else if (action == "add_edoor") {
        myEditableBuilding.mode = "add";
        myEditableBuilding.newObject = new Door();
        myEditableBuilding.newObject.type = "exit";
    }
    else if (action == "add_label") {
        myEditableBuilding.mode = "add";
        myEditableBuilding.newObject = new Label();
    }
}

function setLabelText(e) {
    if (e.keyCode == 13 && myEditableBuilding.newObject && myEditableBuilding.newObject.kind == "label") {
        myEditableBuilding.newObject.text = (<HTMLInputElement>document.getElementById("label_text")).value;
    }
}


window.onload = function () {
    init();
};