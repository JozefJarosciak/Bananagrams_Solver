// Define global variables
var grid = new Array([]);
var inputCharacters = "";
var originputCharacters = "";
var remainingCharacters = "";
var foundWordsArray = new Array([]);
var counterRepeater = 1;
var longestWord = 100;
var maxIterations = 10;
var dictionary = "";
var finished = false;
var finalWordsArray = new Array([]);


this.onmessage = function (e) {
    if (e.data.addThis !== undefined) {
        inputCharacters = e.data.addThis.inputCharacters;
        originputCharacters = e.data.addThis.inputCharacters;
        shortestWord = e.data.addThis.shortestWord;
        longestWord = e.data.addThis.longestWord;
        maxIterations = e.data.addThis.maxiterations;
        dictionary = e.data.addThis.dictionary;
        console.log("Worker received inputCharacters: " + e.data.addThis.inputCharacters + " | longestWord:" + longestWord);
    }

    gridSolver(counterRepeater);
}

function gridSolver(itt) {

    finalWordsArray = new Array([]);
    grid = new Array([]);
    //  inputCharacters = "";
    remainingCharacters = "";
    foundWordsArray = new Array([]);

    if (!itt) {

        if (counterRepeater === 0) {
            itt = 0;
        }

    }

    inputCharacters = originputCharacters;
    console.log("---------------------------------------------------------");
    console.log("STARTING ITERATION: " + itt);
    console.log("---------------------------------------------------------");


    //  inputCharacters = document.getElementById("input").value.toString();
    console.log(inputCharacters + " | Length: " + inputCharacters.length);

    // initialize Grid array
    fill2DimensionsArray(grid, (inputCharacters.length * 3), (inputCharacters.length * 3) );

    // FIRST WORD PLACEMENT


    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../api/api.php?q=" + inputCharacters + "&offset=" + itt + "&shortestWord=" + shortestWord + "&longestWord=" + longestWord + "&dictionary=" + dictionary+ "&first=1", false);  // synchronous request
    xhr.send(null);

    var firstWord = xhr.responseText.split('|');
    inputCharacters = firstWord[0];
    remainingCharacters = firstWord[1];

    finalWordsArray.push(firstWord[0] + "|" + firstWord[2]);

    placeFirstWord(inputCharacters);
    showGrid(inputCharacters.length, inputCharacters.length);

    //console.log("Placed 1st word:" + inputCharacters + " on the grid! | Remainder:" + remainingCharacters);
    console.log("Found: " +inputCharacters.toUpperCase() + " | Remainder: " + remainingCharacters.toUpperCase());
    //console.log("Description: " + firstWord[2]);
    //this.postMessage({result: "Placed 1st word:" + inputCharacters + " on the grid! | Remainder:" + remainingCharacters});
    this.postMessage({result: "<br>Iteration <b>" + itt + "</b>. Starting with word: <b>" + inputCharacters.toUpperCase() + "</b><br><br>"});


    // 2ND WORD CHECK
    ///////////////////
    ///// START 1 /////
    ///////////////////
    // remainingCharacters = foundWordsArray[0].remainder;
    if (remainingCharacters === "") {
        endProgramSolutionFound();
    } else {


        // if remainder exists we need to try letters on the board + remainder
        setFoundArray();
        finished = false;

        for (var x = 0; x < foundWordsArray.length; ++x) {
            // if you find the word in the array of found words that has no remainder, place it on the grid
            if (foundWordsArray[x].remainder === "") {
                finished = true;
                addWordToGrid(x);
                showGrid(inputCharacters.length, inputCharacters.length);
                break; // no need to continue
            }
        }


        if (finished === false) {
            addWordToGrid(0);
            showGrid(inputCharacters.length, inputCharacters.length);
        } else {
            endProgramSolutionFound();
        }


        // 3RD+ WORDs CHECK
        ///////////////////
        ///// START 3 /////
        ///////////////////

        remainingCharacters = foundWordsArray[0].remainder;
        if (remainingCharacters === "") {
            // showGrid(inputCharacters.length,inputCharacters.length);
            this.postMessage({end: "end"});
        }

        while (remainingCharacters.length !== 0) {

            try {
                remainingCharacters = foundWordsArray[0].remainder;
               // console.log("Remaining: '" + remainingCharacters + "'");
            } catch (e) {
                this.postMessage({grid: "."});
                this.postMessage({buttonName: "Solve"});
            }

            if (!remainingCharacters) {
                showGrid(inputCharacters.length, inputCharacters.length);
                break;
            }

            // if remainder exists we need to try letters on the board + remainder
            setFoundArray();
            finished = false;
            for (var x = 0; x < foundWordsArray.length; ++x) {
                // if you find the word in the array of found words that has no remainder, place it on the grid
                if (foundWordsArray[x].remainder === "") {
                    finished = true;
                    addWordToGrid(x);
                    showGrid(inputCharacters.length, inputCharacters.length);
                    endProgramSolutionFound;
                    //  showGrid(inputCharacters.length,inputCharacters.length);
                    break; // no need to continue
                }
            }

            if (finished === false) {
                addWordToGrid(0);
                showGrid(inputCharacters.length, inputCharacters.length);
            } else {
                if (remainingCharacters === "") {
                    //    showGrid(inputCharacters.length,inputCharacters.length);
                    endProgramSolutionFound();
                    break;
                    //exit;
                }
                endProgramSolutionFound();
                break;
            }
        }


    }

    this.postMessage({buttonName: "Solve"});
    //document.getElementById("button").value = "Solve";


}

function endProgramSolutionFound() {


    var placedCharacters = 0;
    for (var yy = 0; yy < (grid[0].length) - 1; ++yy) {
        for (var xx = 0; xx < (grid[0].length) - 1; ++xx) {
            if (grid[xx][yy]) {
                placedCharacters++;
            }
        }
    }


    if (originputCharacters.length === placedCharacters) {
        this.postMessage({result: "<hr><h3>Bananagram Solved!</h3> All " + originputCharacters.length + " tiles were successfully placed:<br><br>"});
        this.postMessage({buttonName: "Solve"});
        //console.log("1: " + finalWordsArray[1]);
        //console.log("2: " + finalWordsArray[2]);
        //console.log("3: " + finalWordsArray[3]);
        this.postMessage({description: finalWordsArray});
    } else {
        this.postMessage({result: "<hr><h3>Sorry, I am not able to solve this Bananagram!</h3>"});
        this.postMessage({grid: "."});
    }


}

function addWordToGrid(selectedItem) {
    //  console.log("Common Letter: " + grid[foundWordsArray[selectedItem].x][foundWordsArray[selectedItem].y]);
    //find where we can place the word: Top to bottom, or Left to right
    var commonCharacter;
    var commonLetterFirstPosition;

    try {
        var word = foundWordsArray[selectedItem].word;
        //console.log("Placing on grid word: " + word + " - Remainder:" + foundWordsArray[selectedItem].remainder);

        console.log("Found: " + word.toUpperCase() + " | Remainder: " + foundWordsArray[selectedItem].remainder.toUpperCase());
        commonCharacter = grid[foundWordsArray[selectedItem].x][foundWordsArray[selectedItem].y];
        commonLetterFirstPosition = word.indexOf(commonCharacter);


        //console.log("Common Letter: " + commonCharacter + " - at position: " + commonLetterFirstPosition);
        finished = false;

        for (var yy = 0; yy < (grid[0].length) - 1; ++yy) {

            for (var xx = 0; xx < (grid[0].length) - 1; ++xx) {
                if (grid[xx][yy]) {

                    if (commonCharacter === grid[xx][yy]) {


                        if (finished === false) {
                            var topToBottomOccupied = false;
                            for (var scanY = (yy - commonLetterFirstPosition) - 1; scanY < (yy + word.length) + 1; ++scanY) {
                                if (scanY !== yy) {
                                    //this.postMessage({progressCell: xx.toString()+"x"+scanY.toString()});
                                    if (grid[xx][scanY]) {
                                        topToBottomOccupied = true;
                                    }
                                } else {
                                    // console.log("+grid["+xx+"]["+scanY+"] = " + grid[xx][scanY]);

                                }
                            }

                            for (var scanY1 = (yy - commonLetterFirstPosition); scanY1 < (yy + word.length); ++scanY1) {
                                if (scanY1 !== yy) {
                                    if (grid[xx - 1][scanY1]) {
                                        topToBottomOccupied = true;
                                    }
                                    if (grid[xx + 1][scanY1]) {
                                        topToBottomOccupied = true;
                                    }
                                } else {
                                    // console.log("+grid["+xx+"]["+scanY+"] = " + grid[xx][scanY]);
                                }
                            }

                            //console.log("topToBottomOccupied = " + topToBottomOccupied);
                            if (topToBottomOccupied === false) {
                                var pos = 0;
                                for (var scanYY = (yy - commonLetterFirstPosition); scanYY < (yy + word.length); ++scanYY) {
                                    grid[xx][scanYY] = word.charAt(pos).toUpperCase();;
                                    pos++;
                                }
                                //console.log("Successfully Placed: " + foundWordsArray[selectedItem].word + " on the grid top to bottom!");


                                console.log("Successfully Placed Word: " + foundWordsArray[selectedItem].word.toUpperCase() + " on the grid top to bottom!");
                                //console.log("Description: " + foundWordsArray[selectedItem].description);
                                finalWordsArray.push(foundWordsArray[selectedItem].word + "|" + foundWordsArray[selectedItem].description);

                                finished = true;

                                break;
                            }
                        }


                        if (finished === false) {
                            var leftToRightOccupied = false;
                            for (var scanX = (xx - commonLetterFirstPosition) - 1; scanX < (xx + word.length) + 1; ++scanX) {
                                if (scanX !== xx) {
                                    if (grid[scanX][yy]) {
                                        leftToRightOccupied = true;
                                    }
                                } else {
                                    // console.log("+grid["+xx+"]["+scanY+"] = " + grid[xx][scanY]);
                                }
                            }

                            for (var scanX1 = (xx - commonLetterFirstPosition); scanX1 < (xx + word.length); ++scanX1) {
                                if (scanX1 !== xx) {
                                    if (grid[scanX1][yy - 1]) {
                                        leftToRightOccupied = true;
                                    }
                                    if (grid[scanX1][yy + 1]) {
                                        leftToRightOccupied = true;
                                    }
                                } else {
                                    // console.log("+grid["+xx+"]["+scanY+"] = " + grid[xx][scanY]);
                                }
                            }

                            //console.log("leftToRightOccupied = " + leftToRightOccupied);
                            if (leftToRightOccupied === false) {
                                pos = 0;
                                for (var scanXX = (xx - commonLetterFirstPosition); scanXX < (xx + word.length); ++scanXX) {
                                    grid[scanXX][yy] = word.charAt(pos).toUpperCase();
                                    pos++;
                                }
                                console.log("Successfully Placed Word: " + foundWordsArray[selectedItem].word.toUpperCase() + " on the grid left to right!");
                               // console.log("Description: " + foundWordsArray[selectedItem].description);
                                finalWordsArray.push(foundWordsArray[selectedItem].word + "|" + foundWordsArray[selectedItem].description);
                                finished = true;

                                //  console.log("--------------------------");
                                break;
                            }
                        }


                    }

                }


            }


        }


    }
    catch (err) {

        counterRepeater++;
        console.log("---------------------------------------------------------")
        console.log("DID NOT FIND SOLUTION, TRYING: " + counterRepeater + " TIME")
        console.log("---------------------------------------------------------")


        if (counterRepeater > maxIterations) {
            this.postMessage({result: "I did not find the solution in the first " + maxIterations + " iterations. Try changing the settings!"});
            this.postMessage({grid: "."});
            this.postMessage({buttonName: "Solve"});
            this.postMessage({end: "end"});
        } else {
            counterRepeater++;
            gridSolver(counterRepeater);
        }

    }


    if (finished === false) {
        counterRepeater++;
        console.log("---------------------------------------------------------");
        console.log("COULD NOT FINISH! remaining characters: " + remainingCharacters);
        console.log("---------------------------------------------------------");
        if (counterRepeater > maxIterations) {
            this.postMessage({result: "<font size=\"3\" color=\"red\">Sorry, but solution cannot be found in first " + maxIterations + " iterations. Try changing the settings!</font></p>"});
            this.postMessage({grid: "."});
            this.postMessage({buttonName: "Solve"});
            this.postMessage({end: "end"});

        } else {

            gridSolver(counterRepeater);
        }
    }
}


function setFoundArray() {
    var letterFromBoard = "";
    foundWordsArray = [];
    foundWordsArray.length = 0; // clear array
    for (var y = 0; y < (grid[0].length) - 1; ++y) {
        for (var x = 0; x < (grid[0].length) - 1; ++x) {
            if (grid[x][y]) {
                letterFromBoard = grid[x][y];
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "../api/api.php?q=" + (remainingCharacters + letterFromBoard) + "&offset=0"  + "&shortestWord=" + shortestWord + "&longestWord=" + longestWord + "&dictionary=" + dictionary+ "&first=0", false);  // synchronous request
                xhr.send(null);
                //console.log("X:" +x + " x Y:" + y + " : " + remainingCharacters+ " + " +letterFromBoard);
                var firstWord = xhr.responseText.split('|');
                // console.log(firstWord[0] + " : " + firstWord[1]+ " : " + firstWord[2]);

                if (firstWord[0].indexOf(letterFromBoard) > -1) {
                    foundWordsArray.push({
                        "x": x,
                        "y": y,
                        "word": firstWord[0],
                        "remainder": firstWord[1],
                        "description": firstWord[2],
                        "length": firstWord[0].length
                    });
                }

            }
        }
    }
    // sort found words by length
    foundWordsArray.sort(function (a, b) {
        return parseFloat(b.length) - parseFloat(a.length);
    });
}


function placeFirstWord(inputCharacters) {
    // First word placement
    var firstWordSplit = inputCharacters.split('');
    for (var c = 0; c < firstWordSplit.length; ++c) {
        grid[((inputCharacters.length+2) + c)][(inputCharacters.length+2)] = firstWordSplit[c].toUpperCase();
    }
}

function showGrid(xs, ys) {
    var gridTable = "<table id=\"mytable\">";
    var gridTable2 = "";

    for (var y = 0; y < (ys * 3); ++y) {
        gridTable += '<tr>';
        var gridTable2 = "";
        var itemsInRow = false;
        for (var x = 0; x < (xs * 3); ++x) {
            if (grid[x][y]) {
                gridTable2 += '<td id="decorate">';
                gridTable2 += grid[x][y];
                itemsInRow = true;
            } else {
                gridTable2 += '<td id="' + x.toString() + "x" + y.toString() + '">';
                 // gridTable2 += "<small>"+x + " x " + y + "</small>";
            }
            gridTable2 += '</td>';
        }

        if (itemsInRow === true) {
            gridTable += gridTable2;
        }

        gridTable += '</tr>';
    }

    gridTable += "</table>";


    // POST BACK GRID
    this.postMessage({grid: gridTable});
    //document.getElementById("grid").innerHTML = gridTable;
}


function fill2DimensionsArray(arr, rows, columns) {
    for (var i = 0; i < rows; i++) {
        arr.push([0])
        for (var j = 0; j < columns; j++) {
            arr[i][j] = 0;
        }
    }
}

function upperCase(a) {
    setTimeout(function () {
        a.value = a.value.toUpperCase();
    }, 1);
}