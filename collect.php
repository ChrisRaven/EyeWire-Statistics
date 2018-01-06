<?php
require '../credentials/pass.php';

$pdo = new PDO(
  "mysql:host={$host};dbname={$dbname}", $user, $pass,
  [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

$points = json_decode($_POST['points']);
$cubes = json_decode($_POST['cubes']);
$trailblazes = json_decode($_POST['trailblazes']);
$scouts = json_decode($_POST['scouts']);
$scythes = json_decode($_POST['scythes']);
$completes = json_decode($_POST['completes']);

function insert($tbl, $table) {
global $pdo;

  if (count($table)) {
    $query1 = "INSERT INTO results (uid, date, {$tbl}) VALUES ";
    $query2 = 'INSERT IGNORE INTO users (uid, name, country_code) VALUES ';
    $inserts1 = [];
    $inserts2 = [];
    foreach ($table as $entry) {
      $inserts1[] = "({$entry->id}, '{$entry->date}', {$entry->points})";
      $inserts2[] = "({$entry->id}, '{$entry->username}', '{$entry->country}')";
    }
    $query1 .= implode(',', $inserts1) . " ON DUPLICATE KEY UPDATE {$tbl} = VALUES({$tbl})";
    $query2 .= implode(',', $inserts2);

    $result = $pdo->exec($query1);

    if ($result === false) {
      var_dump($pdo->errorInfo());
    }
    $result = $pdo->exec($query2);

    if ($result === false) {
      var_dump($pdo->errorInfo());
    }
  }
}

insert('points', $points);
insert('cubes', $cubes);
insert('trailblazes', $trailblazes);
insert('scouts', $scouts);
insert('scythes', $scythes);
insert('completes', $completes);

echo 'ok';


/*
select country_code, sum(points) as points, sum(cubes), sum(trailblazes), sum(scouts), sum(scythes), sum(completes) from results
left join users using (uid)
group by country_code  
ORDER BY `points`  DESC
*/