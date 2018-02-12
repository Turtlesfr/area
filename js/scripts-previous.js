$(document).ready(function()
{
	window.onresize = function(event) {
	}
	createEchelle();
	view.onClick = function()
	{
		//unselectAll();
	}
	$("#ratio-change").click(function()
	{
		//calculate ratio
		//check for real pixel echelle length
		var vector = echelle.children[1].position - echelle.children[2].position;
		var echelleInPixels = (vector.length).toFixed(2);
		var wantedLength = $("#ratio-input").val();
		ratio = wantedLength/echelleInPixels;
		updateEchelle();
		for(var i=0; i < surfaces.length;i++)
		{
			console.log(surfaces[i].path);
			updateLabels(surfaces[i].path);
		}
	});	
});
$(".add-surface").click(function(e)
{
	e.preventDefault();
	addSurface();
});
var surfaces = [];
var ratio = 1;
var point_echelle_left = new Point(50,50);
var point_echelle_right = new Point(200,50);
var echelle_handle_radius = 5;
var echelle = new Group();
var labels = {};
var colors = ["#c39a6b","#f05a28","#27a9e1","#a99dcb","#6ba3d1","#8ea35f","#e9ca5d","#de9a32","#d33728","#851c45","#c5447b","#3258a6","#8ac3c9","#519265","#a8c762","#ba723e","#854c27","#253271"];
var colorIndex = 0;
var point_TL = new Point(50,50);
var point_TR = new Point(200,50);
var point_BR = new Point(200,200);
var point_BL = new Point(50,200);
var selectedElements = [];
var latestSelectedElementName = "";
var globalScopeElement;
var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 20
};
var segment, path;
var movePath = false;
paper.settings.handleSize = 5;
function createEchelle()
{
	var path = new Path.Line(point_echelle_left,point_echelle_right);
	path.strokeColor = 'black';
	path.dashArray = [4,6];
	var echelle_handle_1 = new Path.Circle(point_echelle_left,echelle_handle_radius);
	var echelle_handle_2 = new Path.Circle(point_echelle_right,echelle_handle_radius);
	echelle_handle_1.strokeColor = 'black';
	echelle_handle_2.strokeColor = 'black';
	echelle_handle_1.fillColor = 'grey';
	echelle_handle_2.fillColor = 'grey';

	var vector = point_echelle_left - point_echelle_right;
	var length_label = new PointText((point_echelle_right+vector/2)-new Point(0,10));
	length_label.sendToBack();
	length_label.fillColor = 'black';
	length_label.justification = 'center';
	length_label.content = (vector.length/ratio).toFixed(2);
	$("#ratio-input").val((vector.length/ratio).toFixed(2));
	echelle.addChild(path);
	echelle.addChild(echelle_handle_1);
	echelle.addChild(echelle_handle_2);
	echelle.addChild(length_label);
}
function updateEchelle()
{
	// update line
	echelle.children[0].segments[0].point = echelle.children[1].position;
	echelle.children[0].segments[1].point = echelle.children[2].position;
	//update label position
	var vector = echelle.children[1].position - echelle.children[2].position;
	echelle.children[3].position = new Point((echelle.children[2].position+vector/2)-new Point(0,10));
	echelle.children[3].content = (vector.length*ratio).toFixed(2);
	//update textfield for echelle value
	$("#ratio-input").val((vector.length*ratio).toFixed(2));
}
function addSurface()
{
	var nom = Math.random().toString(36).substring(7);
	var surface = new Surface(nom);
	surfaces.push(surface);
	createLabels(surface.path,nom);

	var button = "<button type='button' class='delete-surface' value='"+nom+"'>Delete "+nom+"</button>";
	var menu_element = "<div class='surface-box'><div class='surface-box-bg' style='background-color:"+colors[colorIndex-1]+"'></div><div class='surface-box-content'><span class='span-delete-surface'><a href='' title='"+nom+"' class='delete-surface'><i class='fa fa-trash-o'></i>&nbsp; Supprimer</a></span><span class='span-surface-size'></span></div></div>";

	$("#surface-list").append(menu_element);
	//$("#surface-list").children().last().append(button);
	//$("#surface-list").find("button").unbind().click(function(e)
	$(".delete-surface").click(function(e)
	{
		e.preventDefault();
		console.log("o");
		//elementIdentifier = $(this).attr('value');
		elementIdentifier = $(this).attr("title");
		var obj = $.grep(surfaces, function(obj){return obj.nom === elementIdentifier;})[0];
		obj.path.remove();
		destroyLabels(elementIdentifier);
		$(this).parent().parent().parent().remove();
	})
	/*
	$("#surface-list").find("a .delete-surface").unbind().click(function(e)
	{
		e.preventDefault();
		console.log("o");
		//elementIdentifier = $(this).attr('value');
		elementIdentifier = $(this).attr("title");
		var obj = $.grep(surfaces, function(obj){return obj.nom === elementIdentifier;})[0];
		obj.path.remove();
		destroyLabels(elementIdentifier);
		$(this).parent().remove();
	});
	*/
}
var Surface = Base.extend({
	initialize: function(nouveau_nom) 
	{
		Base.call(this);
		var rd = Math.random()*300;
		this.path = new Path();
		this.nom = this.name = nouveau_nom;
		this.path.name = nouveau_nom;
		this.taille = 20;

		this.path.add(point_TL+rd);
		this.path.add(point_TR+rd);
		this.path.add(point_BR+rd);
		this.path.add(point_BL+rd);
		this.path.closed = true;
		this.path.fillColor = colors[colorIndex];
		this.path.isDraggable = true;
		colorIndex++;
		//this.path.fillColor = 'blue';
		this.path.strokeColor = 'black';
		this.path.opacity = 0.5;
		this.path.onClick = function()
		{
			unselectAll();
			path.selected = true;
		}
		this.path.attach('mouseenter', function() {
	    	$.each($("#surface-list").find("button").parent(),function()
	    	{
	    		$(this).removeClass("selectedItem");
	    	});
	    	$('button[value="'+this.name+'"]').parent().addClass("selectedItem");
		});
		return this;
	},
	destroy: function()
	{
		this.path.remove();
	}
});
function createLabels(item,nom)
{
	segment_length = item.segments.length;
		var label_collection = [];
		for(var i=-1; i <= segment_length-2; i++)
		{
			if(i==-1)
			{
				var vector = item.segments[segment_length-1].point - item.segments[i+1].point;
				var length_label = new PointText(item.segments[i+1].point+vector/2);
			}
			else
			{
				var vector = item.segments[i+1].point - item.segments[i].point;
				var length_label = new PointText(item.segments[i].point+vector/2);
			}	
			length_label.sendToBack();			
			length_label.fillColor = 'black';
			length_label.justification = 'center';
			length_label.content = (vector.length/ratio).toFixed(2);
			label_collection.push(length_label);
		}
		labels[nom] = label_collection;
}
function updateLabels(item)
{
	var proxyItem;
	if(item)
	{
		proxyItem = item;
	}
	else
	{
		proxyItem = globalScopeElement;
	}
	var segment_length = proxyItem.segments.length;
	for(var i=-1; i <= segment_length-2; i++)
		{
			var new_length;
			if(i==-1)
			{
				var vector = proxyItem.segments[segment_length-1].point - proxyItem.segments[i+1].point;
				labels[proxyItem.name][segment_length-1].position = proxyItem.segments[i+1].point+vector/2;
				labels[proxyItem.name][segment_length-1].content = (vector.length*ratio).toFixed(2);
			}
			else
			{
				var vector = proxyItem.segments[i+1].point - proxyItem.segments[i].point;
				labels[proxyItem.name][i].position = proxyItem.segments[i].point+vector/2;
				labels[proxyItem.name][i].content = (vector.length*ratio).toFixed(2);
			}
		}
}
function destroyLabels(item_name)
{
	console.log("deleted item : "+item_name);
	arrayLength = labels[item_name].length;
		for(var i=0;i<arrayLength;i++)
		{
			labels[item_name][i].remove();
		}
}
function recreateLabels(item,item_name)
{
	destroyLabels(item_name);
	createLabels(item,item_name);	
}
function onMouseDown(event) {
	if(event.item.className)
	{
		latestSelectedElementName = event.item.className;
	}
	//globalScopeElement is preventing bug from loosing focus on dragged element. We reference on mouseDown and reuse when focus is loosed
	var hitResult = project.hitTest(event.point, hitOptions);
	if (!hitResult)
	{
		unselectAll();
		return;
	}
	else
	{
		globalScopeElement = event.item;
		var item_name = event.item.name;
		segment = path = null;
		path = hitResult.item;

		if(event.item.className == "PointText")
		{

		}
		else
		{
			if(event.item.selected)
			{
				if (hitResult.type == 'segment') 
				{
					if (event.modifiers.shift) 
					{
						hitResult.segment.remove();
						recreateLabels(event.item,item_name);
						return;
					}
					segment = hitResult.segment;
				} 
				else if (hitResult.type == 'stroke') 
				{
					var location = hitResult.location;
					segment = path.insert(location.index + 1, event.point);
					recreateLabels(event.item,item_name);
					//path.smooth();
				}
			}
		}
	}
}
function onMouseMove(event) {
	segment = path = null;
	var hitResult = project.hitTest(event.point, hitOptions);
	project.activeLayer.selected = false;
	if(event.item)
	{
		switch(event.item.className)
		{
			case "PointText":
			break;
			case "Group":
			break;
			case "Path" :
			event.item.selected = true;
			break;
			default:
			break;
		}
	}
}
function onMouseDrag(event) {
	if (segment)
	{
		segment.point += event.delta;
		//path.smooth();
	} 
	else if (path) 
	{
		if(latestSelectedElementName=="Group")
		{
			updateEchelle();
		}
		path.position += event.delta;
	}
	updateLabels(event.item);
}
function unselectAll()
{
	globalScopeElement = null;
	var items = project.selectedItems;
	items.forEach(function(element)
	{
		element.selected = false;
	});
}
// UPLOAD PLAN

var canvas = new fabric.Canvas('canvas-plan');

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
	canvas.setHeight(window.innerHeight);
	canvas.setWidth(window.innerWidth);
	canvas.renderAll();
}
resizeCanvas();

document.getElementById('imageLoader').addEventListener("change", function (e) {

	bringToFront("canvas-plan");
	
	var file = e.target.files[0];
	var reader = new FileReader();
	reader.onload = function (f) {
	var data = f.target.result;  
	fabric.Image.fromURL(data, function (img) {
		var ratio = 1;
		if(img.height>canvas.height)
		{
			ratio = canvas.height / img.height;
			console.log("ratioWidth : "+ratio);
		}
		if(img.width*ratio > canvas.width)
		{
			ratio = canvas.width / img.width;
			console.log("ratioHeight : "+ratio);
		}
		ratio = ratio-0.2;
		var oImg = img.set({left:canvas.width/2, top: canvas.height/2, angle: 0,width:img.width, height:img.height, originX: "center", originY: "center",centeredScaling: true}).scale(ratio);
		canvas.add(oImg).renderAll();
		var a = canvas.setActiveObject(oImg);
		var dataURL = canvas.toDataURL({format: 'png', quality: 0.8});
	});
	}
	reader.readAsDataURL(file);
	// hide INPUT and show Delete Button
	$(".step-no-plan").hide();
	//$("#imageLoader").hide();
	$(".step-setup-plan").show();
	//$("#delete-image").show();
	//$("#accept-image").show();
	//$("#box-plan").append("<input type='button' id='delete-image' value='Supprimer le plan'><input type='button' id='accept-image' value='OK'>");
	// remove loaded image and switch back to LOAD INVITE
	$("#box-plan").find("#delete-image").unbind().click(function(e) //DELETE
	{
		canvas.remove(canvas.getActiveObject());
		//switch back to INPUT invite
		$("#imageLoader").show();
		//$("#box-plan").find("#delete-image").hide();
		//$("#box-plan").find("#accept-image").hide();
		//$("#box-plan").find("#modify-image").hide();
		bringToFront('canvas-draw');
	});
	$("#box-plan").find("#accept-image").unbind().click(function(e) //ACCEPT
	{
		//$("#box-plan").find("#accept-image").hide();
		$("#box-mesures").show();
		bringToFront('canvas-draw');
		//$("#box-plan").find("#delete-image").show();
		//$("#box-plan").find("#modify-image").show();
	});
	$("#box-plan").find("#modify-image").unbind().click(function(e) //MODIFY
	{
		$("#box-plan").find("#delete-image").hide();
		bringToFront('canvas-plan');
		//$("#box-mesures").hide();
		//$("#box-plan").find("#modify-image").hide();
		//$("#box-plan").find("#accept-image").show();
	});
});
function bringToFront(canvas_name)
{
	var canvas_front;
	var canvas_back;
	switch(canvas_name)
	{
		case "canvas-draw":
			canvas_back = $(".canvas-container");
			canvas_front = $("#myCanvas");
			$("#box-mesures").show();
		break;
		case "canvas-plan":
			canvas_front = $(".canvas-container");
			canvas_back = $("#myCanvas");
			$("#box-mesures").hide();
		break;
	}
	canvas_front.css('z-index', 3000);
	canvas_front.css('opacity',1);
	canvas_back.css('z-index',1000);
	canvas_back.css('opacity',0.5);
	console.log("cFront : "+canvas_front);
	console.log("cBack : "+canvas_back);
}