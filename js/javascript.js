function removePlaceholder() {
    document.getElementById("input").placeholder = "";
}

function webWorkerThread() {

    document.getElementById("button").value = "processing...";
    document.getElementById("button").disabled = true;
    document.getElementById("button").style.background = '#787878';

    var worker = new Worker('js/search.js');


    var shortestWord = document.getElementById("shortestWord").value;
    var longestWord = document.getElementById("longestWord").value;
    var maxiterations = document.getElementById("maxiterations").value;

    // send message to web worker
    var message = {
        addThis: {
            shortestWord: shortestWord,
            longestWord: longestWord,
            maxiterations: maxiterations,
            inputCharacters: document.getElementById("input").value.toString()
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
            document.getElementById("grid").innerHTML += "<br><hr>";
        }

        if (e.data.end) {
            worker.terminate();
        }

        if (e.data.progressCell) {
            worker.terminate();
        }


    };
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