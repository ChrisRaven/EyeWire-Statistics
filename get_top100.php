<?php
require '../credentials/pass.php';

$pdo = new PDO(
  "mysql:host={$host};dbname={$dbname}", $user, $pass,
  [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

$type = $_GET['type'];

if (!in_array($type, ['points', 'cubes', 'trailblazes', 'scouts', 'scythes', 'completes'])) {
  return false;
}

$query = "CALL get_top100('{$type}')";

$result = $pdo->query($query);

if (!$result) {
  return false;
}

$allResults = [];

function prepareResults($period) {
  global $result, $allResults;

  $localResults = [];
  while ($row = $result->fetch()) {
    $localResults[] = $row;
  }
  
  $allResults[$period] = $localResults;
}

prepareResults('day');
$result->nextRowset();
prepareResults('week');
$result->nextRowset();
prepareResults('month');
$result->nextRowset();
prepareResults('year');
$result->nextRowset();
prepareResults('forever');
$result->nextRowset();

$domain = $_SERVER['HTTP_ORIGIN'];

if (in_array($domain, ['https://eyewire.org', 'https://beta.eyewire.org', 'https://chris.eyewire.org
'])) {
  header('Access-Control-Allow-Origin: ' . $domain);
echo json_encode($allResults);
}
