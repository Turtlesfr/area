$(".add-surface").click(function(e)
{
	e.preventDefault();
	var surface = new Surface();
	surface.createLabels();
});
var surfaces = [];
var echelle_length = 1;
var Surface = function()
{
	var rd = Math.random()*300;
	var path = new Path();
	this.labels = [];
	this.nom = Math.random().toString(36).substring(7);
	this.taille = 0;
	
	path.add(point_TL+rd);
	path.add(point_TR+rd);
	path.add(point_BR+rd);
	path.add(point_BL+rd);
	path.closed = true;
	path.fillColor = colors[$("#surface-list > div").length];
	path.strokeColor = 'black';
	path.opacity = 0.5;
	path.name = this.nom;

	this.surfacePath = path;
	this.surfacePath.attach('mouseenter', function() {
    	$.each($("#surface-list").find("button").parent(),function()
    	{
    		$(this).removeClass("selectedItem");
    	});
    	$('button[value="'+this.name+'"]').parent().addClass("selectedItem");
	});
	this.button = "<button type='button' class='delete-surface' value='"+this.nom+"'>Delete</button>";
	this.menu_element = "<div class='surface-box'>Surface n°"+surfaces.length+"</div>";

	$("#surface-list").append(this.menu_element);
	$("#surface-list").children().last().append(this.button);
	$("#surface-list").find("button").click(function(e)
	{
		/*----------------destroy--------------*/
		elementIdentifier = $(this).attr('value');
		var obj = $.grep(surfaces, function(obj){return obj.nom === elementIdentifier;})[0];
		obj.surfacePath.remove();
		$(this).parent().remove();
	});
	surfaces.push(this);
	this.createLabels = function()
	{
		segment_length = this.surfacePath.segments.length;
		console.log(segment_length);
		for(var i=-1; i <= segment_length; i++)
		{
			if(i==-1)
			{
				var vector = this.surfacePath.segments[segment_length-1].point - this.surfacePath.segments[i+1].point;
				var length_label = new PointText(this.surfacePath.segments[i+1].point+vector/2);
			}
			else
			{
				var vector = this.surfacePath.segments[i+1].point - this.surfacePath.segments[i].point;
				var length_label = new PointText(this.surfacePath.segments[i].point+vector/2);
			}	
			
			length_label.fillColor = 'black';
			length_label.content = (vector.length/echelle_length).toFixed(2);
			this.labels.push(length_label);
		}
	}
	this.updateLabels = function()
	{

	}
}
var colors = ["#609dee","#ee607e","#60ee67","#eee660","#60eece","#607bee","#beee60","#ee6060","#c8c8c8"];
var point_TL = new Point(50,50);
var point_TR = new Point(200,50);
var point_BR = new Point(200,200);
var point_BL = new Point(50,200);

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};
var segment, path;
var movePath = false;
function onMouseDown(event) {
	segment = path = null;
	var hitResult = project.hitTest(event.point, hitOptions);
	if (!hitResult)
		return;

	if (event.modifiers.shift) {
		if (hitResult.type == 'segment') {
			hitResult.segment.remove();
		};
		return;
	}
	if (hitResult) {
		path = hitResult.item;
		if (hitResult.type == 'segment') {
			segment = hitResult.segment;
		} else if (hitResult.type == 'stroke') {
			var location = hitResult.location;
			segment = path.insert(location.index + 1, event.point);
			//path.smooth();
		}
	}
	movePath = hitResult.type == 'fill';
	if (movePath)
	{
		project.activeLayer.addChild(hitResult.item);
	}
}
function onMouseMove(event) {
	segment = path = null;
	var hitResult = project.hitTest(event.point, hitOptions);
	project.activeLayer.selected = false;
	if (event.item)
	{
		if(event.item.className == "PointText")
		{

		}
		else
		{
			event.item.selected = true;
		}		
	}
}
function onMouseDrag(event) {
	if(event.item.className == "PointText")
		{

		}
		else
		{
			if (segment) 
			{
				segment.point += event.delta;
				//path.smooth();
			} 
			else if (path) 
			{
				path.position += event.delta;
				console.log(path.parent);
			}
		}
}