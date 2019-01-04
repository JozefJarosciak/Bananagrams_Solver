<?php
// ---------------------------------
//error_reporting(E_ALL); ini_set('display_errors', 1);
mb_internal_encoding("UTF-8");

// get MYSQL credentials ($username,$password) from credentials.php (you must create the file
include("credentials.php");

// ---------------------------------

// Connect to MySQL DB
$mysqli = new mysqli("localhost", $username, $password, "dictionaries");
$mysqli->query("SET NAMES 'utf8'");
$mysqli->query("SET CHARACTER SET utf8");
$mysqli->query("SET SESSION collation_connection = 'utf8_unicode_ci'");

// Set some of the variables

$shortestWord = htmlspecialchars(mb_strtolower(($_GET["shortestWord"])));
$longestWord = htmlspecialchars(mb_strtolower(($_GET["longestWord"])));
$characters = htmlspecialchars(mb_strtolower(($_GET["q"])));
$characters = preg_replace('/(\?+)/', '', $characters);
$characters = strtoupper(preg_replace('/(\+)/', '', $characters));
$remainingCharacters = $characters;
$characters_length = mb_strlen($characters, "UTF-8");
$offset_position = htmlspecialchars(mb_strtolower(($_GET["offset"])));

if (($characters_length < 1) || ($offset_position < 0)) {
    exit;
}

// Define Arrays
$characters_Array = str_split($characters);
$chars_UniqueOnlyArray = array_unique($characters_Array);


// SEARCH THE DICTIONARY + FIND REMAINING CHARACTERS
if ($characters_length <= 100) { // Do not allow search over 100 characters long
    // Build SQL Query
    $sql = buildSQLQuery($characters, $characters_Array, $chars_UniqueOnlyArray, $offset_position, $shortestWord, $longestWord); //echo $sql."<BR>";

    // Search Database
    $result = mysqli_query($mysqli, $sql);
    $row = mysqli_fetch_array($result);
    $foundWord = strtoupper($row['word']);
    $foundRank = strtoupper($row['rank']);
    echo $foundWord;

    // find remaining characters
    $foundWord_Array = str_split($foundWord);
    for ($i = 0; $i < sizeof($foundWord_Array); ++$i) {
        $remainingCharacters = str_replace_first($foundWord_Array[$i], '', $remainingCharacters);
    }
    echo "|" . $remainingCharacters . "|" . $foundRank;
}

// Close MySQL Connection
mysqli_close($mysqli);


// *****************
// *** FUNCTIONS ***
// *****************

// SQL Query Builder
function buildSQLQuery($characters, $characters_Array, $chars_UniqueOnlyArray, $offset_position, $shortestWord, $longestWord)
{
    $finchar = strtolower($characters);
    $sqlQuery = "SELECT word,rank FROM en_english20k WHERE LOWER(word) REGEXP '^[$finchar]*$'";
    for ($i = 0; $i < sizeof($characters_Array); ++$i) {
        $countCharOccurence = substr_count($characters, $chars_UniqueOnlyArray[$i]);
        if ($countCharOccurence > 0) {
            $sqlQuery .= ' AND (CHAR_LENGTH(LOWER(word)) - CHAR_LENGTH(REPLACE(LOWER(word), \'' . strtolower($chars_UniqueOnlyArray[$i]) . '\', \'\')) BETWEEN 0 AND ' . $countCharOccurence . ') ';
        }
    }

    if ($longestWord === 1000) {
        $longestWord = strlen($characters);
    }

    $sqlQuery .= ' AND rank BETWEEN 1 AND 20000 AND CHAR_LENGTH(word)>' . ($shortestWord - 1) . ' AND CHAR_LENGTH(word) <=' . $longestWord . ' ORDER BY length(word) DESC, rank ASC LIMIT ' . $offset_position . ',1';
    return $sqlQuery;
}

// Replace First Occurance of String within another String
function str_replace_first($from, $to, $content)
{
    $from = '/' . preg_quote($from, '/') . '/';
    return preg_replace($from, $to, $content, 1);
}

?>