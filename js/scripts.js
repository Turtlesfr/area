PDFJS.workerSrc = "/build/pdf.worker.js";
$(document).ready(function()
{
    function InitialFlip() {
        setTimeout(SecondFlip, 5000);
    }
    function SecondFlip() {
        $(".one, .two").toggle();

        setTimeout(function() {
            $(".one, .two").toggle();
            InitialFlip();
        }, 5000);
    }
    InitialFlip();
    window.addEventListener("resize", resizeCanvas, false);
    $("#myCanvas").click(function(e){
        for(var i=0;i<legendes.length;i++)
        {
            legendes[i].remove();
        }
        legendes = [];
        $("input").blur();
    })
    createEchelle();
    $(".btn-close-modal").click(function(e){
        e.preventDefault();
        $("#modal_container").hide();
    });
    $(".btn-close-modal-plan").click(function(e){
        e.preventDefault();
        canvas.remove(canvas.getActiveObject());
        $(".step-setup-plan").hide();
        $(".step-plan-is-setup").hide();
        $(".step-no-plan").show();
        bringToFront("canvas-draw");
        // reset input file element
        var $el = $("#imageLoader");
        $el.wrap("<form>").closest("form").get(0).reset();
        $el.unwrap();
        $("#modal_container_pdf").hide();
    });
    $(".modal_pdf_pagination ul").on("click", "li", function(e) {
        e.preventDefault();
        var pdfPageToLoad = $(this).text();
        loadSpecificPdfPage(pdfPageToLoad);
        $("#modal_container_pdf").hide();
    });
    $("#form-new-size").submit(function(e)
    {
        if($("#new_size_input").val() > 0)
        {
            resizeLineLength($("#new_size_input").val());
        }
        $("#modal_container").hide();
        return false;
    });
    $("#form-change-echelle").submit(function(e){
        var vector = echelle.children[4].position - echelle.children[5].position;

        var echelleInPixels = (vector.length).toFixed(2);
        var wantedLength = $("#ratio-input").val();
        ratio = wantedLength/echelleInPixels;
        updateEchelle();
        for(var i=0; i < surfaces.length;i++)
        {
            updateLabels(surfaces[i].path);
        }
        //Update areas
        var surfaces_length = surfaces.length;
        for(var i=0;i<surfaces_length;i++)
        {
            refreshAreas(calculateAreas(surfaces[i].path),surfaces[i].path);
        }
        updateTotalSurfaceCount();
        return false;
    })
});
$("#download-canvas").click(function(e)
{
    e.preventDefault();
    $.each(surfaces, function(i,value)
    {
        var area_size_txt_bg = new PointText(surfaces[i].path.position);
        var area_size_txt = new PointText(surfaces[i].path.position);
        legendes.push(area_size_txt_bg);
        legendes.push(area_size_txt);

        area_size_txt.content = area_size_txt_bg.content = $("span."+surfaces[i].name).text()+" m²";
        area_size_txt.justification = area_size_txt_bg.justification = "center";
        area_size_txt.color = "black";
        area_size_txt_bg.color = "white";
        area_size_txt.fontWeight = area_size_txt_bg.fontWeight = "bold";
        area_size_txt.fontSize = area_size_txt_bg.fontSize = 20;
        area_size_txt_bg.strokeWidth = 5;
        area_size_txt_bg.strokeColor = "white";
    });
    var area_total_size_txt_bg = new PointText(40,window.innerHeight - 40);
    var area_total_size_txt = new PointText(40,window.innerHeight - 40);
    area_total_size_txt.content = area_total_size_txt_bg.content = $(".surface-totale").text();
    area_total_size_txt.justification = area_total_size_txt_bg.justification = "left";
    area_total_size_txt.color = "black";
    area_total_size_txt.color = "white";
    area_total_size_txt.fontWeight = area_total_size_txt_bg.fontWeight = "bold";
    area_total_size_txt.fontSize = area_total_size_txt_bg.fontSize = 20;
    area_total_size_txt_bg.strokeWidth = 5;
    area_total_size_txt_bg.strokeColor = "white";

    legendes.push(area_total_size_txt_bg);
    legendes.push(area_total_size_txt);

    var delayMillis = 1000;
    setTimeout(function() {
        var canvas_dl = document.getElementById("canvas-top-infos");
        var ctx = canvas_dl.getContext("2d");
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
        var can_plan = document.getElementById("canvas-plan");
        var can_draw = document.getElementById("myCanvas");
        var canvas_dl_ctx = canvas_dl.getContext("2d");

        canvas_dl_ctx.drawImage(can_plan, 0, 0);
        canvas_dl_ctx.drawImage(can_draw, 0, 0);

        drawing = new Image();

        drawing.src = "img/logo-donga.png";
        drawing.onload = function() {
            canvas_dl_ctx.drawImage(drawing,window.innerWidth/2-100,window.innerHeight - 80);
            ReImg.fromCanvas(document.getElementById("canvas-top-infos")).downloadPng();
        };

    }, delayMillis);

    //downloadCanvas(e.target, 'canvas-top-infos', 'test.png');
});
function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}
fabric.Object.prototype.set({
    transparentCorners: false,
    borderColor: "#ff00ff",
    cornerColor: "#ff0000"
});
$(".add-surface").click(function(e)
{
    e.preventDefault();
    addSurface();
});
var surfaces = [];
var tempTriangles = [];
var trianglesGroup = new Group();
var legendes = [];
var delayedTrianglesDestruction;
var classSelectedItem = "";
var shapeIsChanged = false;
var debug = false;
var ratio = 1;
var iTri = 3;
var point_echelle_left = new Point(0,50);
var point_echelle_right = new Point(500,50);
var echelle_handle_radius = 5;
var echelle = new Group();
echelle.name = "echelle";
echelle.data.type = "group";
var labels = {};
var colors = ["#c39a6b","#f05a28","#27a9e1","#a99dcb","#6ba3d1","#8ea35f","#e9ca5d","#de9a32","#d33728","#851c45","#c5447b","#3258a6","#8ac3c9","#519265","#a8c762","#ba723e","#854c27","#253271"];
var colorIndex = 0;
var point_TL = new Point(50,50);
var point_TR = new Point(200,50);
var point_BR = new Point(200,200);
var point_BL = new Point(50,200);
var selectedElements = [];
var selectedElement;
var selectedSurfaceThroughLabel;
var latestSelectedElementName = "";
var globalScopeElement;
var labelOffset = 30;
var cursorDown = false;
var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 10
};
var segment, path;
var movePath = false;
var labelDoubleClicked;
var labelPointA,labelPointB;
var handle_extension_ratio = 10;
var fabricObject;
paper.settings.handleSize = 12;
function createEchelle()
{
    var base_path = new Path.Line(point_echelle_left,point_echelle_right);
    base_path.strokeColor = "#000000";
    base_path.strokeWidth = 6;

    var dotted_path = new Path.Line(point_echelle_left,point_echelle_right);
    dotted_path.strokeColor = "white";
    dotted_path.strokeWidth = 3;
    dotted_path.dashArray = [8,10];
    var echelle_handle_1 = new Path({segments:[point_echelle_left+new Point(0,-10),point_echelle_left+new Point(0,10)]});
    var echelle_handle_2 = new Path({segments:[point_echelle_right+new Point(0,-10),point_echelle_right+new Point(0,10)]});
    echelle_handle_1.strokeColor = "black";
    echelle_handle_1.strokeWidth = 5;
    echelle_handle_2.strokeColor = "black";
    echelle_handle_2.strokeWidth = 5;

    var vector = point_echelle_left - point_echelle_right;
    var length_label_background = new PointText((point_echelle_right+vector/2)-new Point(0,-7));
    var length_label = new PointText((point_echelle_right+vector/2)-new Point(0,-7));
    length_label.sendToBack();
    length_label_background.fillColor = "white";
    length_label.fillColor = "black";
    length_label_background.justification = length_label.justification = "center";
    length_label_background.strokeWidth = 7;
    length_label_background.strokeColor = "white";
    length_label_background.fontSize = length_label.fontSize = 20;
    length_label_background.fontWeight = length_label.fontWeight = "bold";
    length_label_background.content = length_label.content = (vector.length/ratio).toFixed(2);

    //create handle extensions
    var vectorHandle1 = (echelle_handle_1.segments[1].point - echelle_handle_1.segments[0].point)*handle_extension_ratio;
    var handle_extension1 = new Path({segments:[point_echelle_left+new Point(0,10),point_echelle_left+vectorHandle1]});
    handle_extension1.position = echelle_handle_1.position;
    var vectorHandle2 = (echelle_handle_2.segments[1].point - echelle_handle_2.segments[0].point)*handle_extension_ratio;
    var handle_extension2 = new Path({segments:[point_echelle_right+new Point(0,10),point_echelle_right+vectorHandle1]});
    handle_extension2.position = echelle_handle_2.position;
    handle_extension1.strokeColor = handle_extension2.strokeColor = "grey";
    handle_extension1.stokeWidth = handle_extension2.stokeWidth = 5;
    handle_extension1.dashArray = handle_extension2.dashArray = [4,4];

    $("#ratio-input").val((vector.length/ratio).toFixed(2));
    echelle.addChild(handle_extension1); //6
    echelle.addChild(handle_extension2); //7
    echelle.addChild(base_path); //0
    echelle.addChild(dotted_path); //1
    echelle.addChild(echelle_handle_1); //2
    echelle.addChild(echelle_handle_2); //3
    echelle.addChild(length_label_background); //4
    echelle.addChild(length_label); //5

    echelle.transformContent = false;
    echelle.position = view.center/2;

    echelle_handle_1.attach("mouseenter", function() {
        $("#myCanvas").css( "cursor", "pointer");
        this.strokeWidth = 7;
    });
    echelle_handle_2.attach("mouseenter", function() {
        $("#myCanvas").css( "cursor", "pointer" );
        this.strokeWidth = 7;
    });
    echelle_handle_1.attach("mouseleave", function() {
        $("#myCanvas").css( "cursor", "default" );
        this.strokeWidth = 5;
    });
    echelle_handle_2.attach("mouseleave", function() {
        $("#myCanvas").css( "cursor", "default" );
        this.strokeWidth = 5;
    });
    length_label.attach("mouseenter",function(){
        $("#myCanvas").css( "cursor", "move" );
    })
    length_label.attach("mouseleave",function(){
        $("#myCanvas").css( "cursor", "default" );
    })
    echelle_handle_1.attach("mousedrag",function(e){
        echelle_handle_1.position += e.delta;
        updateEchelle();
    });
    echelle_handle_2.attach("mousedrag",function(e){
        echelle_handle_2.position += e.delta;
        updateEchelle();
    });
    echelle_handle_1.attach("mousedown",function(e){
        cursorDown = true;
    });
    echelle_handle_1.attach("mouseup",function(e){
        cursorDown = false;
    });
    echelle_handle_2.attach("mousedown",function(e){
        cursorDown = true;
    });
    echelle_handle_2.attach("mouseup",function(e){
        cursorDown = false;
    });
    length_label.attach("mousedown",function(e){
        cursorDown = true;
    });
    length_label.attach("mouseup",function(e){
        cursorDown = false;
    });
    length_label.attach("mousedrag",function(e){
        echelle.position += e.delta;
    });
}
var lastRotationLeftHandle = 0;
var lastRotationRightHandle = 0;
function updateEchelle()
{
    // update lines
    echelle.children[2].segments[0].point = echelle.children[4].position;
    echelle.children[2].segments[1].point = echelle.children[5].position;

    echelle.children[3].segments[0].point = echelle.children[4].position;
    echelle.children[3].segments[1].point = echelle.children[5].position;

    //update labels position
    var vector = echelle.children[4].position - echelle.children[5].position;
    //label top
    echelle.children[6].position = new Point((echelle.children[5].position+vector/2)-new Point(0,0));
    echelle.children[6].content = (vector.length*ratio).toFixed(2);
    //label bg
    echelle.children[7].position = new Point((echelle.children[5].position+vector/2)-new Point(0,0));
    echelle.children[7].content = (vector.length*ratio).toFixed(2);

    echelle.children[4].rotate(vector.angle - lastRotationLeftHandle - 180);
    echelle.children[5].rotate(vector.angle - lastRotationRightHandle - 180);
    //handle extensions
    echelle.children[0].position = echelle.children[4].position;
    echelle.children[0].rotate(vector.angle - lastRotationLeftHandle - 180);
    echelle.children[1].position = echelle.children[5].position;
    echelle.children[1].rotate(vector.angle - lastRotationRightHandle - 180);

    lastRotationLeftHandle = vector.angle-180;
    lastRotationRightHandle = vector.angle-180;
    $("#ratio-input").val((vector.length*ratio).toFixed(2));
}
function addSurface()
{
    var nom = Math.random().toString(36).substring(7);
    var surface = new Surface(nom);
    surfaces.push(surface);
    createLabels(surface.path,nom);

    var button = "<button type='button' class='delete-surface' value='"+nom+"'>Delete "+nom+"</button>";
    var menu_element = "<div class='surface-box "+nom+"'><div class='surface-box-bg' style='background-color:"+colors[colorIndex-1]+"'></div><div class='surface-box-content'><span class='span-delete-surface'><a href='' title='"+nom+"' class='delete-surface'><i class='fa fa-trash-o'></i>&nbsp; Supprimer</a></span><span class='span-surface-size "+nom+"'></span></div></div>";

    $("#surface-list").append(menu_element);
    $(".delete-surface").click(function(e)
    {
        e.preventDefault();
        elementIdentifier = $(this).attr("title");
        var obj = $.grep(surfaces, function(obj){return obj.nom === elementIdentifier;})[0];
        obj.path.remove();
        var indexOfItemInArray = $.inArray(obj,surfaces);
        surfaces.splice(indexOfItemInArray,1);
        destroyLabels(elementIdentifier);
        $(this).parent().parent().parent().remove();
        updateTotalSurfaceCount();
    });
    refreshAreas(calculateAreas(surface.path),surface.path);
    updateTotalSurfaceCount();
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
        this.path.fillColor.alpha = 0.5;
        this.path.isDraggable = true;
        colorIndex++;
        this.path.strokeColor = "black";
        this.path.dashArray = [4, 10];
        this.path.strokeWidth = 3;
        this.path.strokeCap = "round";

        // EVENTS
        this.path.attach("mousemove",function(e){ // MOVE PATH
            if(!cursorDown)
            {
                // do HIT TEST to change cursor appearance
                var hitResult = project.hitTest(e.point, hitOptions);
                switch(hitResult.type)
                {
                    case "segment":
                        $("#myCanvas").css("cursor","pointer");
                        hitResult.segment.selected = true;
                    break;
                    case "stroke":
                        $("#myCanvas").css("cursor","copy");
                    break;
                    case "fill":
                        $("#myCanvas").css("cursor","move");
                    break;
                    default:
                        $("#myCanvas").css("cursor","default");
                    break;
                }
            }
        });
        this.path.attach("mousedrag",function(e){ // MOVE PATH
            if (segment)
            {
                segment.point = e.point;
                shapeIsChanged = true;
                updateLabels(e.target);
            }
            else if (path)
            {
                shapeIsChanged = false;
                path.position += e.delta;
                updateLabels(e.target);
            }
        });
        this.path.attach("mouseenter", function(e) {
            if(!cursorDown)
            {
                e.target.selected = true;
            }
            $.each($(".surface-box"),function()
            {
                $(this).removeClass("selectedSurface");
            });
            $("#surface-list").find(".surface-box."+this.name+"").addClass("selectedSurface");
        });
        this.path.attach("mouseleave", function(e)
        {

            if(!cursorDown)
            {
                e.target.selected = false;
                $.each($(".surface-box"),function()
            {
                $(this).removeClass("selectedSurface");
            });
            }
            $("#myCanvas").css("cursor","default");
        });
        this.path.attach("mousedown", function(e)
        {
            if(!cursorDown)
            {
                selectedElement = e.target;
                var hitResult = project.hitTest(e.point, hitOptions);
                if (hitResult.type == "segment")
                {
                    if (e.modifiers.shift)
                    {
                        hitResult.segment.remove();
                        recreateLabels(e.target,e.target.name);
                        shapeIsChanged = true;
                        refreshAreas(calculateAreas(e.target),e.target);
                        updateTotalSurfaceCount();
                        return;
                    }
                    segment = hitResult.segment;
                }
                else if (hitResult.type == "stroke")
                {
                    var location = hitResult.location;
                    segment = e.target.insert(location.index + 1, e.point);
                    shapeIsChanged = true;
                    recreateLabels(e.target,e.target.name);
                }
                else if (hitResult.type == "fill")
                {
                    path = hitResult.item;
                }
            }
            cursorDown = true;
        });
        this.path.attach("mouseup", function(e)
        {
            cursorDown = false;
            if(segment)
                segment.selected = false;
            //segment.selected = false;
            segment = path = null;
            refreshAreas(calculateAreas(e.target),e.target);
            updateTotalSurfaceCount();
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
            var length_label;
            if(i==-1)
            {
                var vector = item.segments[segment_length-1].point - item.segments[i+1].point;
                length_label = new PointText(item.segments[i+1].point+vector/2);
            }
            else
            {
                var vector = item.segments[i+1].point - item.segments[i].point;
                length_label = new PointText(item.segments[i].point+vector/2);
            }
            length_label.name = nom;
            length_label.sendToBack();
            length_label.fillColor = "black";
            length_label.justification = "center";
            length_label.content = (vector.length/ratio).toFixed(2);
            label_collection.push(length_label);
            length_label.attach("mouseenter",function(e){
                    $("#myCanvas").css("cursor","pointer");
                });
            length_label.attach("mouseleave",function(e){
                    $("#myCanvas").css("cursor","default");
                });
            length_label.attach("mousedrag",function(e){
                    item.position += e.delta;
                });
            length_label.attach("doubleclick",function(e)
            {
                labelDoubleClicked = e.target;
                // get surface name associated with label
                var surface_name = e.target.name;
                // find index of label within array of labels
                var indexOfLabel = labels[surface_name].indexOf(e.target);
                // find pointA and pointB related to label
                var surfaceObject = $.grep(surfaces, function(obj){return obj.nom === surface_name;})[0];
                selectedSurfaceThroughLabel = surfaceObject;
                var segmentCount = surfaceObject.path.segments.length-1; // -1 is to normalize with indexOfLabel and start with 0
                /// if label is last : target last point & FIRST point
                if(indexOfLabel == segmentCount)
                {
                    labelPointA = surfaceObject.path.segments[indexOfLabel];
                    labelPointB = surfaceObject.path.segments[0];
                }
                /// else : target point & point+1
                else
                {
                    labelPointA = surfaceObject.path.segments[indexOfLabel];
                    labelPointB = surfaceObject.path.segments[indexOfLabel+1];
                }
                //pointB.point += new Point(10,10);
                //open modal
                $("#new_size_input").val(null);
                $("#new_size_input").attr("placeholder",e.target.content);
                $("#modal_container").fadeIn("fast", function() {
                    $("#new_size_input").focus();
                });
            });
        }
        labels[nom] = label_collection;
        updateLabels(item);
}
function resizeLineLength(newLength)
{
    //labelDoubleClicked
    //labelPointA
    //labelPointB
    var vector = labelPointB.point - labelPointA.point;
    var vector = labelPointA.point - labelPointB.point;
    var factor = (newLength/vector.length)/ratio;
    labelPointB.point = labelPointA.point - vector*factor;
    updateLabels(selectedSurfaceThroughLabel.path);
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
    if(proxyItem)
    {
        var segment_length = proxyItem.segments.length;
        var center = proxyItem.position;
        var smallVector = new Point(0,20) - new Point(0,0);
        for(var i=-1; i <= segment_length-2; i++)
            {
                var vector_length;
                if(i==-1)
                {
                    var vector = proxyItem.segments[segment_length-1].point - proxyItem.segments[i+1].point;
                    vector_length = vector.length;
                    var middleOfStroke = proxyItem.segments[i+1].point+vector/2;
                    var vectorNinetyDegrees = vector;
                    vectorNinetyDegrees.length = 20;
                    vectorNinetyDegrees.angle += 90;
                    labels[proxyItem.name][segment_length-1].position = middleOfStroke + vectorNinetyDegrees;
                    labels[proxyItem.name][segment_length-1].content = (vector_length*ratio).toFixed(2);
                }
                else
                {
                    var vector = proxyItem.segments[i+1].point - proxyItem.segments[i].point;
                    vector_length = vector.length;
                    var middleOfStroke = proxyItem.segments[i].point+vector/2;
                    var vectorNinetyDegrees = vector;
                    vectorNinetyDegrees.length = 20;
                    vectorNinetyDegrees.angle -= 90;
                    labels[proxyItem.name][i].position = middleOfStroke + vectorNinetyDegrees;
                    labels[proxyItem.name][i].content = (vector_length*ratio).toFixed(2);
                }
            }
    }
}
function destroyLabels(item_name)
{
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
function checkStatus(item)
{
    if(item)
    {
        classSelectedItem = event.className;
    }
}

function drawTriangle(triCoords,item)
{
    coords1 = item.segments[triCoords[0]];
    coords2 = item.segments[triCoords[1]];
    coords3 = item.segments[triCoords[2]];

    var path = new Path();
    path.add(coords1);
    path.add(coords2);
    path.add(coords3);
    path.closed = true;
    path.fillColor = "#dedede";
    path.isDraggable = false;
    path.strokeColor = "black";
    path.opacity = 0.5;
    path.sendToBack();
    trianglesGroup.sendToBack();
    trianglesGroup.addChild(path);
    //setup timer before destruction
}
function destroyTempTriangles()
{
    for(var i=0;i<trianglesGroup.length;i++)
    {
        trianglesGroup[i].remove();
    }
    trianglesGroup.removeChildren();
}
function refreshAreas(earcut_result,item)
{
    // CALCULATE TRIANGLE AREAS
    // DRAW TRIANGLES
    var total_triangle_areas=0;

    for(var i=0;i<earcut_result.length;i+=iTri)
    {
        //length1
        var l1 = (item.segments[earcut_result[i+1]].point-item.segments[earcut_result[i]].point).length;
        var l2 = (item.segments[earcut_result[i+2]].point-item.segments[earcut_result[i+1]].point).length;
        var l3 = (item.segments[earcut_result[i]].point-item.segments[earcut_result[i+2]].point).length;
        total_triangle_areas += heron(l1,l2,l3);
        //total_triangle_areas += heron();
        if(debug)
        {
            drawTriangle(new Array(earcut_result[i],earcut_result[i+1],earcut_result[i+2]),item);
        }
    }
    //destroy triangles
    if(debug)
    {
        delayedTrianglesDestruction = window.setTimeout(destroyTempTriangles, 5000);
    }
    // update areas in surface list
    $("span."+item.name).text(Math.round(total_triangle_areas*100)/100);
}
function heron(l1,l2,l3)
{
    l1 = l1*ratio;
    l2 = l2*ratio;
    l3 = l3*ratio;
    //step 1 : s = (l1+l2+l3)/2
    var s = (l1+l2+l3)/2;
    //step 2 : racine(s(s-l1)(s-l2)(s-l3))
    var val = (Math.sqrt(s*(s-l1)*(s-l2)*(s-l3)))/10000;
    return val;
}
function calculateAreas(item)
{
    if(item)
    {
        var number_of_points = item.segments.length;
        var surface_coord = [];
        for(var j=0; j < number_of_points; j++)
        {
            var pointX = Math.round(item.segments[j].point.x*100)/100;
            var pointY = Math.round(item.segments[j].point.y*100)/100;
            surface_coord.push(pointX);
            surface_coord.push(pointY);
        }
        var triangles = earcut(surface_coord);
        //var triangles = earcut([10,0,0,50,60,60,70,10]);
        return triangles;
    }
    updateTotalSurfaceCount();
}

// UPLOAD PLAN
var canvas = new fabric.Canvas("canvas-plan");
var canvas_pdf = document.getElementById("canvas_pdf");

function resizeCanvas() {
    canvas.setHeight(window.innerHeight);
    canvas.setWidth(window.innerWidth);
    canvas.renderAll();
}
resizeCanvas();
var pdfObj;
function loadSpecificPdfPage(pageNum)
{
    pdfObj.getPage(parseInt(pageNum)).then(function(page) {
                        var scale = 1.5;
                        var viewport = page.getViewport(scale);

                        var context = canvas_pdf.getContext("2d");
                        canvas_pdf.height = viewport.height;
                        canvas_pdf.width = viewport.width;

                        var renderContext = {
                          canvasContext: context,
                          viewport: viewport
                        };
                        page.render(renderContext).promise.then(function(){
                            fabric.Image.fromURL(canvas_pdf.toDataURL(), function (img) {
                                var ratio = 1;
                                if(img.height>canvas_pdf.height)
                                {
                                    ratio = canvas_pdf.height / img.height;
                                }
                                if(img.width*ratio > canvas_pdf.width)
                                {
                                    ratio = canvas_pdf.width / img.width;
                                }
                                ratio = ratio-0.2;
                                var oImg = img.set({left:canvas.width/2, top: canvas.height/2, angle: 0,width:img.width, height:img.height, originX: "center", originY: "center",centeredScaling: true}).scale(ratio);
                                canvas.add(oImg).renderAll();
                                var fabricObject = oImg;
                                var a = canvas.setActiveObject(oImg);
                                var dataURL = canvas.toDataURL({format: "png", quality: 0.8});
                            });
                            context.clearRect(0, 0, canvas.width, canvas.height);
                        });

                    });
}

document.getElementById("imageLoader").addEventListener("change", function (e)
{
    bringToFront("canvas-plan");
    var file = e.target.files[0];
    if(file.type== "application/pdf")
    {
        var reader = new FileReader();
        reader.onload = function(e)
        {
            var typedarray = new Uint8Array(this.result);
            PDFJS.getDocument(typedarray).then(function (pdf) {
                pdfObj = pdf;
                var numPages = pdf.numPages;
                if(numPages > 1)
                {
                    $("#modal_container_pdf").show();
                    $(".modal_pdf_pagination ul").html("");
                    for(var i=0;i<numPages;i++)
                    {
                        var pageNumber = i+1;
                        $(".modal_pdf_pagination ul").append("<li>"+pageNumber+"</li>");
                    }
                }
                else
                {
                    pdf.getPage(1).then(function(page) {
                        var scale = 1.5;
                        var viewport = page.getViewport(scale);
                        var context = canvas_pdf.getContext("2d");
                        canvas_pdf.height = viewport.height;
                        canvas_pdf.width = viewport.width;

                        var renderContext = {
                          canvasContext: context,
                          viewport: viewport
                        };
                        page.render(renderContext).promise.then(function(){
                            fabric.Image.fromURL(canvas_pdf.toDataURL(), function (img) {
                                var ratio = 1;
                                if(img.height>canvas_pdf.height)
                                {
                                    ratio = canvas_pdf.height / img.height;
                                }
                                if(img.width*ratio > canvas_pdf.width)
                                {
                                    ratio = canvas_pdf.width / img.width;
                                }
                                ratio = ratio-0.2;
                                var oImg = img.set({left:canvas.width/2, top: canvas.height/2, angle: 0,width:img.width, height:img.height, originX: "center", originY: "center",centeredScaling: true}).scale(ratio);
                                canvas.add(oImg).renderAll();
                                var fabricObject = oImg;
                                var a = canvas.setActiveObject(oImg);
                                var dataURL = canvas.toDataURL({format: "png", quality: 0.8});
                            });
                            context.clearRect(0, 0, canvas.width, canvas.height);

                        });

                    });
                }
            });
        }
        reader.readAsArrayBuffer(file);
        // hide INPUT and show Delete Button
        $(".step-no-plan").hide();
        $(".step-setup-plan").show();
    }
    else
    {
        // do image stuff
        var reader = new FileReader();
        reader.onload = function (f)
        {
            var data = f.target.result;
            fabric.Image.fromURL(data, function (img) {
                var ratio = 1;
                if(img.height>canvas.height)
                {
                    ratio = canvas.height / img.height;
                }
                if(img.width*ratio > canvas.width)
                {
                    ratio = canvas.width / img.width;
                }
                ratio = ratio-0.2;
                var oImg = img.set({left:canvas.width/2, top: canvas.height/2, angle: 0,width:img.width, height:img.height, originX: "center", originY: "center",centeredScaling: true}).scale(ratio);
                canvas.add(oImg).renderAll();
                var a = canvas.setActiveObject(oImg);
                var dataURL = canvas.toDataURL({format: "png", quality: 0.8});
            });
        }
        reader.readAsDataURL(file);
        // hide INPUT and show Delete Button
        $(".step-no-plan").hide();
        $(".step-setup-plan").show();
    }
});
$(".delete-image").click(function(e){
    canvas.remove(canvas.getActiveObject());
    $(".step-setup-plan").hide();
    $(".step-plan-is-setup").hide();
    $(".step-no-plan").show();
    bringToFront("canvas-draw");
    // reset input file element
    var $el = $("#imageLoader");
    $el.wrap("<form>").closest("form").get(0).reset();
    $el.unwrap();
});
$("#accept-image").click(function(e){
    bringToFront("canvas-draw");
    $(".step-setup-plan").hide();
    $(".step-plan-is-setup").show();
    canvas_pdf.getContext("2d").clearRect(0, 0, canvas_pdf.width, canvas_pdf.height);
});
$("#modify-image").click(function(e){
    bringToFront("canvas-plan");
    $(".step-plan-is-setup").hide();
    $(".step-setup-plan").show();
});
function bringToFront(canvas_name)
{
    var canvas_front;
    var canvas_back;
    switch(canvas_name)
    {
        case "canvas-draw":
        /*
            fabric.Object.prototype.setControlsVisibility({
                mt: false,
                mb: false,
                tl: false,
                tr: false,
                bl: false,
                br: false
            });
            */
            canvas_back = $(".canvas-container");
            canvas_front = $("#myCanvas");
            $("#box-mesures").show();
            $("#box-surfaces").show();
            $("#box-download").show();

        break;
        case "canvas-plan":
            canvas_front = $(".canvas-container");
            canvas_back = $("#myCanvas");
            $("#box-mesures").hide();
            $("#box-surfaces").hide();
            $("#box-download").hide();
        break;
    }
    canvas_front.css("z-index", 3000);
    canvas_front.css("opacity",1);
    canvas_back.css("z-index",1000);
    canvas_back.css("opacity",0.5);
}
$("#ratio-input").keypress(function(event) {
    var $this = $(this);
    if ((event.which != 46 || $this.val().indexOf(".") != -1) &&
       ((event.which < 48 || event.which > 57) &&
       (event.which != 0 && event.which != 8))) {
           event.preventDefault();
    }
    var text = $(this).val();
    if ((event.which == 46) && (text.indexOf(".") == -1)) {
        setTimeout(function() {
            if ($this.val().substring($this.val().indexOf(".")).length > 3) {
                $this.val($this.val().substring(0, $this.val().indexOf(".") + 3));
            }
        }, 1);
    }

    if ((text.indexOf(".") != -1) &&
        (text.substring(text.indexOf(".")).length > 2) &&
        (event.which != 0 && event.which != 8) &&
        ($(this)[0].selectionStart >= text.length - 2)) {
            event.preventDefault();
    }
    // 13 is keypress for RETURN
    if (event.which == 13) {
        $("#form-change-echelle").submit();
    }
});

$("#ratio-input").bind("paste", function(e) {
var text = e.originalEvent.clipboardData.getData("Text");
if ($.isNumeric(text)) {
    if ((text.substring(text.indexOf(".")).length > 3) && (text.indexOf(".") > -1)) {
        e.preventDefault();
        $(this).val(text.substring(0, text.indexOf(".") + 3));
   }
}
else {
        e.preventDefault();
     }
});
function updateTotalSurfaceCount()
{
    var total = 0;
    $.each($(".span-surface-size"),function(index,item)
    {
        console.log($(this).text());
        total += Number($(this).text());
        //total += item.find('.span-surface-size').val();
        //console.log(item.find('.span-surface-size').val());
    });
    if(total>0)
    {
        $(".surface-totale span").text(total.toFixed(2));
        $(".surface-totale").show();
    }
    else
    {
        $(".surface-totale").hide();
    }


}