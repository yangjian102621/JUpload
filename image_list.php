<?php
header("Content-Type:text/html; charset=UTF-8");
$image_dir = __DIR__."/files";
$files = array();
$handler = opendir($image_dir);
if ( $handler != false ) {
    while ( $filename = readdir($handler) ) {
        if ( $filename != "." && $filename != ".." ) {
            array_push($files, "files/".$filename);
        }
    }
}
$code = empty($files) ? 1 : 0;
echo json_encode(array("code" => $code, "data" => $files));
die();
