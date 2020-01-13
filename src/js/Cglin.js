var Cglin = {
	version: "0.0.1",
	author: "cglin.com",
	start: "2018-4-26",

	//------------------
	framefunctions: [],
	autoframe: true
};

var Cg = Cglin;

Cg.onframe = function() {
	for(var i = 0, len = Cg.framefunctions.length; i < len; i++)
		Cg.framefunctions[i]();

	if(Cg.autoframe)
		requestAnimationFrame(Cg.onframe)
}

Cg.run = function(callback) {
	Cg.framefunctions.add(callback);
}

Cg.cancl = function(callback) {
	Cg.framefunctions.remove(callback);
}

requestAnimationFrame(Cg.onframe)