<?php
$word = htmlspecialchars(mb_strtolower(($_GET["q"])));
// ---------------------------------
//error_reporting(E_ALL); ini_set('display_errors', 1);
mb_internal_encoding("UTF-8");

// get MYSQL credentials ($username,$password) from credentials.php (you must create the file
include("credentials.php");

// Connect to MySQL DB
$mysqli = new mysqli("localhost", $username, $password, "dictionaries");
$mysqli->query("SET NAMES 'utf8'");
$mysqli->query("SET CHARACTER SET utf8");
$mysqli->query("SET SESSION collation_connection = 'utf8_unicode_ci'");
$sql = "SELECT * FROM en_english479k WHERE word='".$word."'"; //echo $sql."<BR>";

// Search Database
$result = mysqli_query($mysqli, $sql);
$row = mysqli_fetch_array($result);
$foundWord = $row['word'];
$foundDescription = $row['description'];
if (substr($foundDescription, 0, strlen(": ")) == ": ") {
    $foundDescription = substr($foundDescription, strlen(": "));
}

if ($foundDescription===null) {
    $doc = new DOMDocument;
    $doc->preserveWhiteSpace = false;
    $doc->strictErrorChecking = false;
    $doc->recover = true;
    $doc->loadHTMLFile("https://www.merriam-webster.com/dictionary/".$word);
    $xpath = new DOMXPath($doc);
    $query = "//div[@class='vg']";
    $entries = $xpath->query($query);
    $foundDescription = $entries->item(0)->textContent;
    if (substr($foundDescription, 0, strlen(": ")) == ": ") {
        $foundDescription = substr($foundDescription, strlen(": "));
    }

    $foundDescription = preg_replace("/[\r\n]*/","",$foundDescription);
    $foundDescription = preg_replace('/\s+/', ' ',$foundDescription);

    if (strlen($foundDescription)>0) {
        // Connect to MySQL DB
        $servername = "localhost";
        $dbname = "dictionaries";
        $conn = new mysqli($servername, $username, $password, $dbname);
        if ($conn->connect_error) {            die("Connection failed: " . $conn->connect_error);        }


        $stmt = $conn->prepare("UPDATE en_english479k SET description=? WHERE word=?");
        $stmt->bind_param("ss", trim($foundDescription), $word);
        $stmt->execute();
        $stmt->close();

        $conn->close();


        if (substr($foundDescription, 0, strlen(": ")) == ": ") {
            $foundDescription = substr($foundDescription, strlen(": "));
        }
        echo trim($foundDescription);
     }



} else {
    if (substr($foundDescription, 0, strlen(": ")) == ": ") {
        $foundDescription = substr($foundDescription, strlen(": "));
    }
    echo $foundDescription;
}




