$('document').ready(function(){
	$("#surfaces-links > ul > li").click(function(e)
	{
		$.each($("#surfaces-links > ul > li"), function(){
			$(this).removeClass("active");
		});
		var i=1;
		$.each($(".canvas-layer"), function(){
			$(this).css('z-index', i);
			i++;
		});
		activeLiName = $(this).attr('class');
		console.log(activeLiName);
		$(this).addClass("active");
		$("#"+activeLiName).css('z-index', 3000);
	})

	var echelleColor = 'black';

	var LayerComp = function()
	{
		this.nom = "";
		this.type = ""; 
	}

	var Surface = function(id){
		this._p = mypapers[id];
		this.nom = "";
		this.couleur = "";
		this.coordonnees = [];
		console.log('nouvelle surface créée');
	}

	var Echelle = function()
	{
		this._p = mypapers[0];
		this.longueur = 0;
		this.firstPoint = new Point(50,50);
		this.lastPoint = new Point(300,50);
		this.contour = new Path();
		contour.strokeColor = echelleColor;
		contour.moveTo(firstPoint);
		contour.lineTo(lastPoint);
	}

	var surface1 = new Surface(1);
	var echelle = new Echelle();
})

var mypapers = [];
mypapers[0] = new paper.PaperScope();
mypapers[1] = new paper.PaperScope();
mypapers[2] = new paper.PaperScope();
mypapers[3] = new paper.PaperScope();
mypapers[4] = new paper.PaperScope();
mypapers[5] = new paper.PaperScope();
mypapers[6] = new paper.PaperScope();

mypapers[0].setup($("#canvas-echelle")[0]);
mypapers[1].setup($("#canvas-shape1")[0]);
mypapers[2].setup($("#canvas-shape2")[0]);
mypapers[3].setup($("#canvas-shape3")[0]);
mypapers[4].setup($("#canvas-shape4")[0]);
mypapers[5].setup($("#canvas-shape5")[0]);
mypapers[6].setup($("#canvas-shape6")[0]);


