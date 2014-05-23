/// <reference path="objects.ts"/>
/// <reference path="obview.ts"/>



function init() {
    var data, b;

    data = JSON.parse('[{ "kind": "wall", "info": { "x1": 1, "y1": 1, "x2": 5, "y2": 1 } }, { "kind": "wall", "info": { "x1": 5, "y1": 1, "x2": 5, "y2": 5 } }, { "kind": "wall", "info": { "x1": 5, "y1": 5, "x2": 1, "y2": 5 } }, { "kind": "wall", "info": { "x1": 1, "y1": 5, "x2": 1, "y2": 1 } }, {"kind": "stair", "info": {"x": 10, "y": 10}, "type": "both"}, {"kind": "door", "info": {"x": 8, "y": 2}, "angle": 0, "type": "normal"}, {"kind": "label", "info": {"x": 2, "y": 2}, "text": "zzz"}]');

    b = new EditableBuilding();
    b.setInitialObjects(data);

}

window.onload = function () {
    init();
};