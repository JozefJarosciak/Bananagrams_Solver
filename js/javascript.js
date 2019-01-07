
function removePlaceholder() {
    document.getElementById("input").placeholder = "";
}

function webWorkerThread() {

    if (document.getElementById("input").value.length > 2) {
    document.getElementById("foundwords").innerHTML = "";
    document.getElementById("button").value = "processing...";
    document.getElementById("button").disabled = true;
    document.getElementById("button").style.background = '#787878';
    document.getElementById("shortestWord").disabled = true;
    document.getElementById("longestWord").disabled = true;
    document.getElementById("dictionary").disabled = true;
    document.getElementById("maxiterations").disabled = true;
    document.getElementById("input").disabled = true;
    document.getElementById("random").disabled = true;
    document.getElementById("randLen").disabled = true;



    var worker = new Worker('js/search.js');


    var shortestWord = document.getElementById("shortestWord").value;
    var longestWord = document.getElementById("longestWord").value;
    var maxiterations = document.getElementById("maxiterations").value;
    var dictionary = document.getElementById("dictionary").value;
    // send message to web worker
    var message = {
        addThis: {
           shortestWord: shortestWord,
            longestWord: longestWord,
            maxiterations: maxiterations,
            inputCharacters: document.getElementById("input").value.toString(),
            dictionary: dictionary
        }
    };
    worker.postMessage(message);

    // get message from web worker
    worker.onmessage = function (e) {

        if (e.data.result) {
            //console.log(e.data.result);
            document.getElementById("message").innerHTML = e.data.result;
        }

        if (e.data.grid) {
            // Clean Grid
            var resultGrid = e.data.grid;
            resultGrid = resultGrid.replaceAll("<tr></tr>", "");

            document.getElementById("grid").innerHTML = resultGrid;
            // console.log(resultGrid);
            if (e.data.grid === ".") {
                document.getElementById("grid").innerHTML = "";
            }
        }

        if (e.data.buttonName) {
            document.getElementById("button").value = e.data.buttonName;
            document.getElementById("button").disabled = false;
            document.getElementById("button").style.background = '#008CBA';
            document.getElementById("shortestWord").disabled = false;
            document.getElementById("longestWord").disabled = false;
            document.getElementById("dictionary").disabled = false;
            document.getElementById("maxiterations").disabled = false;
            document.getElementById("input").disabled = false;
            document.getElementById("random").disabled = false;
            document.getElementById("randLen").disabled = false;

            /*
            if (document.getElementById("grid").innerHTML.indexOf("<hr>" < 0)) {
            document.getElementById("grid").innerHTML += "<hr>";
            }
            */

        }

        if (e.data.end) {
            worker.terminate();
        }

        if (e.data.description) {
            //console.log(e.data.description);
            var arrayOfFoundWords = e.data.description;
            var finallist = "<hr><table id=\"resultWords\">";
            for (var i = 1; i < arrayOfFoundWords.length; i++) {
                //console.log(arrayOfFoundWords[i]);
                var finalword = arrayOfFoundWords[i].split("|");
                finallist += "<tr><td id=\"leftcell\"><b>" + finalword[0].toUpperCase() + "</b></td><td id='leftcell'><small>   " + finalword[1]+"</small></td></tr>";
            }
            finallist += "</table>"
            document.getElementById("foundwords").innerHTML += finallist;
            worker.terminate();
        }


    };

    } else {}


}

function makeRandomString() {
    var text = "";
    var possible =
        "EEEEEEEEEEEE" +
        "AAAAAAAAA"+
        "IIIIIIIII"+
        "OOOOOOOO"+
        "NNNNNN"+
        "RRRRRR"+
        "TTTTTT"+
        "LLLL"+
        "SSSS"+
        "UUUU"+
        "DDDD"+
        "GGG"+
        "BB"+
        "CC"+
        "MM"+
        "PP"+
        "K"+
        "J"+
        "X"+
        "Q"+
        "Z";


    if (document.getElementById("dictionary").value.indexOf("sk_") > -1) {
        console.log(document.getElementById("dictionary").value.indexOf("sk_"));
        possible =
            "AAAAAAAAAOOOOOOOOO" +
            "EEEEEEEEIIIIINNNNNRRRRSSSSTTTTVVVV"+
            "MMMMDDDKKKLLLPPP"+
            "JJUUBB"+
            "ÁCHYZ"+
            "ČÍŠÝŽÉĽŤÚĎFGŇÔÄĹÓŔ"+
            "X";
    } else {
        console.log(document.getElementById("dictionary").value.indexOf("sk_"));
    }


    for (var i = 0; i < document.getElementById("randLen").value; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    document.getElementById("input").value = text;

}



function upperCase(a) {
    setTimeout(function () {
        a.value = a.value.toUpperCase();
    }, 1);
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


