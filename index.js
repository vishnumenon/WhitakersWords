function loadScript(url, callback){
	var script = document.createElement("script")
		script.type = "text/javascript";

	if (script.readyState){  //IE
		script.onreadystatechange = function(){
			if (script.readyState == "loaded" ||
					script.readyState == "complete"){
						script.onreadystatechange = null;
						callback();
					}
		};
	} else {  //Others
		script.onload = function(){
			callback();
		};
	}

	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
}

function main() {	
	$("#search").on('click', function(e) { 
		e.preventDefault();
		document.body.style.cursor = 'wait';
		setTimeout(processWords, 10);
		$("#definitions").html("<br /><br />Loading...")
	});
}
function processWords() {
	$("#definitions").html("");
	$.each($("#word-query")[0].value.split(" "), function(){
		$("#definitions").append("<br /><br /><u><span style='background: yellow; padding-top: 6pt; height: 22pt; font-size: 15pt; display: block;'>" + this + "</span></u><br /><br />" + getDefinition(this) );
	});
	$
	document.body.style.cursor = 'default';
}

function getStems(entry) {
	var stems = entry.latin.slice(0);
	// is a verb: 
	if (entry.latin.length >= 4 && entry.latin[1].indexOf("re") == entry.latin[2].length - 2 && entry.latin[2].indexOf("i") == entry.latin[2].length - 1) {
		stems.push(entry.latin[1].substring(0, entry.latin[1].indexOf("re")));
		stems.push(entry.latin[3].substring(0, entry.latin[2].indexOf("i")));
	} 
	// is a noun:
	// or 2 part adj
	else if (entry.latin.length == 2 ) {
		var ending = entry.latin[1].substring(entry.latin[1].length - 2);
		if (ending == "ae" || ending == "us" || ending == "is" || ending == "ei") {
			stems.push(entry.latin[1].substring(0, entry.latin[1].length - 2));
		} else if (ending.substring(1) == "i") {
			stems.push(entry.latin[1].substring(0, entry.latin[1].length - 1));
		} else {
			stems.push(entry.latin[1].substring(0, entry.latin[1].length - 1));
			stems.push(entry.latin[1].substring(0, entry.latin[1].length - 2));
		}	
	}
	// is adj?
	else if (entry.latin.length == 3) {
		stems.push(entry.latin[1].substring(0, entry.latin[1].length - 1));
		stems.push(entry.latin[0].substring(0, entry.latin[1].length - 2));
	}
	return stems.filter(function(str){return str != ""});
}

function getDefinition(word) {
	var word = word.toString().toLowerCase();
	var matches = [];
	var englishRE = new RegExp("(^|\\W)" + word + "($|\\W)");
	for(var i = 0; i < dictionary.words.length; i++) {
		if (usesStems(word, getStems(dictionary.words[i]))) {
			matches.push(dictionary.words[i]);
		}
	}
	matches.sort(function(a, b){return sortFunction(word, a, b)});
	var englishCounter = 0 
	for(var i = 0; i < dictionary.words.length; i++) {
		if (dictionary.words[i].english.search(englishRE) > -1) {
			if (englishCounter < 2) {
				matches.unshift(dictionary.words[i]);
			} else {
				matches.push(dictionary.words[i]);
			}
			englishCounter++;
		}
	}
	return matches.slice(0, 10).map(formatResult).join("<br />");
	}

	function sortFunction(word, entry1, entry2) {
		var tempArray1 = entry1.latin.slice(0);
		tempArray1.push(entry1.english);
		var tempArray2 = entry2.latin.slice(0);
		tempArray2.push(entry2.english);
		return minimumLevenshtein(word, tempArray1)	- minimumLevenshtein(word, tempArray2);
	}

	function usesStems(word, stems) {
		for(var i = 0; i<stems.length; i++) {
			if(word.indexOf(stems[i]) == 0) {
				return true;
			}
		}
		return false;
	}

	function minimumLevenshtein(elem, array) {
		return (array.map(function(item) {return levenshtein(elem, item)}).sort())[0];
	}

	function fuzzyExists(elem, array) {
		return minimumLevenshtein(elem, array) <= .2;
	}

	function formatResult(entry) {
		return "<b>" + entry.latin.join() + "</b> " + entry.info + " -- " + entry.english + "<br />"; 
	}

	function levenshtein( a, b )
	{
		// modified from kevin mcbob, dzone
		var i;
		var j;
		var cost;
		var d = new Array();
		if ( a.length == 0 )
		{
			return b.length;
		}

		if ( b.length == 0 )
		{
			return a.length;
		}

		for ( i = 0; i <= a.length; i++ )
		{
			d[ i ] = new Array();
			d[ i ][ 0 ] = i;
		}

		for ( j = 0; j <= b.length; j++ )
		{
			d[ 0 ][ j ] = j;
		}

		for ( i = 1; i <= a.length; i++ )
		{
			for ( j = 1; j <= b.length; j++ )
			{
				if ( a.charAt( i - 1 ) == b.charAt( j - 1 ) )
				{
					cost = 0;
				}
				else
				{
					cost = 1;
				}

				d[ i ][ j ] = Math.min( d[ i - 1 ][ j ] + 1, d[ i ][ j - 1 ] + 1, d[ i - 1 ][ j - 1 ] + cost );

				if(
						i > 1 && 
						j > 1 &&  
						a.charAt(i - 1) == b.charAt(j-2) && 
						a.charAt(i-2) == b.charAt(j-1)
					){
						d[i][j] = Math.min(
								d[i][j],
								d[i - 2][j - 2] + cost
								)

					}
			}
		}

		return (d[ a.length ][ b.length ]) / Math.max(a.length, b.length);
	}


	loadScript("dictionary.js", main);
