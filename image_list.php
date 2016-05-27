<?php
header("Content-Type:text/html; charset=UTF-8");
$page = intval($_GET["page"]);
$offset = ($page - 1) * 15;
$image_dir = __DIR__."/files";
$files = array();
$handler = opendir($image_dir);
if ( $handler != false ) {
    $i = 0;
    while ( $filename = readdir($handler) ) {
        if ( $filename != "." && $filename != ".." ) {
            if ( $i <= $offset ) {
                $i++;
                continue;
            }
            array_push($files, array("thumbURL" => "files/".$filename, "oriURL" => "files/".$filename));
            $i++;
            if ( $i > $offset + 15 ) break;
        }
    }
}
$code = empty($files) ? 1 : 0;
echo json_encode(array("code" => $code, "data" => $files));
die();
