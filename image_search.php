<?php
header("Content-Type:text/html; charset=UTF-8");
set_time_limit(0);
$page = intval($_GET["page"]);
$kw = trim($_GET['kw']);
$apiUrl = "http://image.baidu.com/search/avatarjson?tn=resultjsonavatarnew&ie=utf-8&word={$kw}&pn={$page}&rn=100&itg=1&z=&fr=&width=400&height=300gsm=25030000003c";
$apiUrl = "http://image.so.com/j?q={$kw}&src=tab_www&sn={$page}&pn=30";
$content = file_get_contents($apiUrl);
$data = json_decode($content, true);
$upload_dir = __DIR__."/files/";
//echo "<pre>";
//print_r($data);die();
$files = array();
if ( is_array($data["list"]) ) {
    foreach ( $data["list"] as $value ) {

        $filename = basename($value["img"]);
        array_push($files, array("thumbURL" => $value["img"], "oriURL" => $value["img"],
            "width" => $value["width"], "height" => $value["height"]));
        continue;

//        $image = @file_get_contents($value["objURL"]);
//        if ( file_exists($upload_dir.$filename) || ($image && file_put_contents($upload_dir.$filename, $image)) ) {
//            array_push($files, array("thumbURL" => "files/".$filename, "oriURL" => "files/".$filename,
//                "width" => $value["width"], "height" => $value["height"]));
//        }
    }
}

$code = empty($files) ? 1 : 0;
echo json_encode(array("code" => $code, "data" => $files));
die();
