"use strict";

var SHAPE = {};

var init = function () {
	// VARIABLES
	SHAPE.canvas = document.getElementById("canvas");
	SHAPE.ctx = SHAPE.canvas.getContext("2d");
	SHAPE.ctx.save();
	SHAPE.color = {
		anchor: "#FFF977",
		outline: "#FFF977"
	};
	SHAPE.cap = document.getElementById("caption");
	SHAPE.shapelist = document.getElementById("shapelist");
	// icon source: https://www.iconfinder.com/iconsets/hawcons-gesture-stroke
	SHAPE.json = '[{"filename":"1_middle_finger.png","title":"Middle Finger"},{"filename":"2_rock_n_roll.png","title":"Rock &amp; Roll"},{"filename":"3_high_five.png","title":"High 5"},{"filename":"6_thumb_up.png","title":"Thumb Up"},{"filename":"7_thumb_down.png","title":"Thumb Down"},{"filename":"27_one_finger_click.png","title":"1 Finger Click"}]';

	SHAPE.menuSelected = {
		element: "",
		id: "",
		color: "blue"
	};
	SHAPE.itemSelected = {
		element: "",
		index: -1
	};
	SHAPE.items = [];
	// = {
	// 	"image": .., 
	// 	"src": .., 
	// 	"posX": .., "posY": .., 
	// 	"posX2": .., "posY2": .., 
	// 	"width": .., "height": ..
	// }
	SHAPE.onmove = false;

	// ADD EVENT LISTENERS
	var clearBtn = document.getElementById("clear");
	clearBtn.addEventListener("click", function(e) {
		SHAPE.ctx.clearRect(0, 0, SHAPE.canvas.width, SHAPE.canvas.height);
		SHAPE.items.splice(0, SHAPE.items.length);	//clean up the array of items! (by slice)
	});

	// fixes a problem where double clicking causes text to get selected on the canvas
	SHAPE.canvas.addEventListener("selectstart", function(e) { e.preventDefault(); return false; }, false);
	SHAPE.canvas.addEventListener("dblclick", function(e) { 
		var image = new Image();
		var src = SHAPE.menuSelected.element.getAttribute("src");
		image.src = src;

		var posX = event.pageX - SHAPE.canvas.offsetLeft;
		var posY = event.pageY - SHAPE.canvas.offsetTop;
		redraw(posX, posY, null);
	}, false);
	SHAPE.canvas.addEventListener("mousedown", function(e) {
		if (SHAPE.items.length <= 0 || !hitImage(e)) {
			return;
		}
		SHAPE.onmove = true;
		SHAPE.canvas.addEventListener("mousemove", dragMoveHandler);	
	}, false);
	SHAPE.canvas.addEventListener("mouseup", stopDragHandler, false);
	SHAPE.canvas.addEventListener("dragend", stopDragHandler, false);
	// SHAPE.canvas.addEventListener("mouseout", stopDragHandler);
	// SHAPE.canvas.addEventListener("click", stopDragHandler);
};

var jsonInit = function () {
	var xhr = new XMLHttpRequest();
	var responseObject;

	xhr.onload = function() {
		if (xhr.status === 200) {
			responseObject = JSON.parse(xhr.responseText);
		}
		SHAPE.json = responseObject;
	};

	xhr.open("GET", "data/data.json", true);
	xhr.send(null);
};

var setShapeList = function () {
	// var data = JSON.parse(data);
	var shapes = JSON.parse(SHAPE.json);
	// var shapes = data.shapes;
	// var shapes = SHAPE.json;
	var i = 0, j = 0;
	var item, img;

	var clickHandler = function(e){
 		if (!e) {
 			e = window.event;
 		}
 		var all = document.querySelectorAll("img");
 		if (all.length > 1) {
 			for (j = 0; j < all.length; j+=1) {
 				all[j].className = "";	// jQuery: removeClass("selected");
 			}
 		}
 		SHAPE.menuSelected.element = e.target || e.srcElement;
 		SHAPE.menuSelected.element.className = "selected";
 		SHAPE.menuSelected.id = SHAPE.menuSelected.element.getAttribute("id");
 	};

	for (i = 0; i < shapes.length; i+=1) {
		console.log("filename: " + shapes[i].filename);	//test
		item = document.createElement("li");
		item.setAttribute("title", shapes[i].title);
		item.setAttribute("id", "item-" + (i+1));
		img = document.createElement("img");
		img.setAttribute("src", "img/" + shapes[i].filename);
		img.setAttribute("id", "icon-" + (i+1));
		item.appendChild(img);
		SHAPE.shapelist.appendChild(item);

		// click = select
		img.addEventListener("click", clickHandler, false);
	 	// img.addEventListener("click", function(e){
	 	// 	if (!e) {
	 	// 		e = window.event;
	 	// 	}
	 	// 	var all = document.querySelectorAll("img");
	 	// 	if (all.length > 1) {
	 	// 		for (j = 0; j < all.length; j+=1) {
	 	// 			all[j].className = "";	// jQuery: removeClass("selected");
	 	// 		};
	 	// 	}
	 	// 	SHAPE.menuSelected.element = e.target || e.srcElement;
	 	// 	SHAPE.menuSelected.element.className = "selected";
	 	// 	SHAPE.menuSelected.id = SHAPE.menuSelected.element.getAttribute("id");
	 	// });
	}
};

var redraw = function (posX, posY, item) {
	var image, 
		src;
	var addItem = false;
	
	if (item === null) {
		image = new Image();
		src = SHAPE.menuSelected.element.getAttribute("src");
		addItem = true;
	} else {
		image = item;
		src = item.src;
		addItem = false;
	}
	image.onload = function() {
		SHAPE.ctx.clearRect(0, 0, SHAPE.canvas.width, SHAPE.canvas.height);
		SHAPE.ctx.restore();
		if (addItem) {
			SHAPE.items.push({ "image": image, "src": src, 
			"posX": posX, "posY": posY, "posX2": posX+image.width, "posY2": posY+image.height, 
			"width": image.width, "height": image.height });	
			setSelectedItem(image, SHAPE.items.length - 1);
			// // draw anchors
			// drawAnchors4Image(posX, posY, image.width, image.height);
		} else if (SHAPE.itemSelected.index >= 0) {
			var origin = SHAPE.items[SHAPE.itemSelected.index];
			origin.posX = posX;
			origin.posX2 = posX + image.width;
			origin.posY = posY;
			origin.posY2 = posY + image.height;
			// SHAPE.items[SHAPE.itemSelected.index] = origin;
			drawOutline(posX - (image.width / 2), posY - (image.height / 2), image.width, image.height);
		}
		var i = 0;
		var currentItem;
		for (i = 0; i < SHAPE.items.length; i+=1) {
			currentItem = SHAPE.items[i];
			SHAPE.ctx.drawImage(currentItem.image, currentItem.posX - (currentItem.image.width / 2), currentItem.posY - (currentItem.image.height / 2), currentItem.image.width, currentItem.image.height);
			// SHAPE.ctx.drawImage(image, posX - (image.width / 2), posY - (image.height / 2), image.width, image.height);
		}
		// if (SHAPE.itemSelected.index >= 0) {
			// draw anchors
			drawAnchors4Image(posX, posY, image.width, image.height);
		// }
	};
	image.src = src;
};

var drawAnchors4Image = function (mouseX, mouseY, imgW, imgH) {
	// draw anchors * 4
	var x = mouseX - (imgW / 2);
	var y = mouseY - (imgH / 2);
	drawAnchor(x, y);
	drawAnchor(x+imgW, y);
	drawAnchor(x, y+imgH);
	drawAnchor(x+imgW, y+imgH);
};

var drawAnchor = function (x, y) {
	SHAPE.ctx.fillStyle = SHAPE.color.anchor;
	SHAPE.ctx.beginPath();
	SHAPE.ctx.arc(x, y, 6, 0, 2*Math.PI);	// radius=2, endAngle=2*PI
	SHAPE.ctx.closePath();
	SHAPE.ctx.fill();
	// SHAPE.ctx.stroke();
};

var drawOutline = function (x, y, width, height) {
	SHAPE.ctx.strokeStyle = SHAPE.color.outline;
	SHAPE.ctx.strokeRect(x, y, width, height);
	// SHAPE.ctx.stroke();
};

var hitImage = function (event) {
	// var target = event.target || event.srcElement;
	var hitX = event.pageX - SHAPE.canvas.offsetLeft;	// clientX?
	var hitY = event.pageY - SHAPE.canvas.offsetTop;	// clientY?
	var items = SHAPE.items;
	var i = 0;
	for (i = 0; i < items.length; i+=1) {
		if (hitX > (items[i].posX - items[i].width/2) && hitX < (items[i].posX2 - items[i].width/2) && 
			hitY > (items[i].posY - items[i].height/2) && hitY < (items[i].posY2 - items[i].height/2)) {
			// set selected image
			// SHAPE.itemSelected.element = items[i].image;
			// SHAPE.itemSelected.index = i;
			setSelectedItem(items[i].image, i);
			return true;
		}
	}
	return false;
};

var setSelectedItem = function (element, index) {
	SHAPE.itemSelected.element = element;
	SHAPE.itemSelected.index = index;
};

var dragMoveHandler = function () {
	var image = SHAPE.itemSelected.element;
	if (!SHAPE.onmove && image) {
		return;
	}
	var posX = event.pageX - SHAPE.canvas.offsetLeft;
	var posY = event.pageY - SHAPE.canvas.offsetTop;
	redraw(posX, posY, SHAPE.itemSelected.element);
};

var stopDragHandler = function () {
	if (SHAPE.onmove) {
		// draw anchors
		var selected = SHAPE.itemSelected;
		var image = SHAPE.itemSelected.element;
		// var posX = event.pageX - SHAPE.canvas.offsetLeft;
		// var posY = event.pageY - SHAPE.canvas.offsetTop;	
		redraw(SHAPE.items[selected.index].posX, SHAPE.items[selected.index].posY, image);
		// drawAnchors4Image(SHAPE.items[selected.index].posX, SHAPE.items[selected.index].posY, image.width, image.height);	

		// remove selection record
		SHAPE.onmove = false;
		SHAPE.canvas.removeEventListener("mousemove", dragMoveHandler);
		SHAPE.itemSelected.element = null;
		SHAPE.itemSelected.index = -1;
	}
};

(function() {
	init();
	// jsonInit();
	setShapeList();

})();

