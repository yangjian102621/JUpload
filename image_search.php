<?php
/**
 * 从百度服务器上搜索图片并返回图片地址列表
 * @author yangjian<yangjian102621@gmail.com>
 */
header("Content-Type:text/html; charset=UTF-8");
set_time_limit(0);
$page = intval($_GET["page"]);
$kw = trim($_GET['kw']);
$apiUrl = "http://image.baidu.com/search/avatarjson?tn=resultjsonavatarnew&ie=utf-8&word={$kw}&pn={$page}&rn=15";
$content = file_get_contents($apiUrl);
$data = json_decode(mb_convert_encoding($content, 'UTF-8','GBK,UTF-8'), true);
$image_dir = __DIR__."/files/";
//echo "<pre>";
//print_r($data);die();
$files = array();
if ( is_array($data["imgs"]) ) {
    foreach ( $data["imgs"] as $value ) {
        $filename = basename($value["objURL"]);
        array_push($files, array("thumbURL" => "image_show.php?img_url={$value["objURL"]}&img_path=files/".$filename, "oriURL" => "files/".$filename,
            "width" => $value["width"], "height" => $value["height"]));
    }
}

$code = empty($files) ? 1 : 0;
echo json_encode(array("code" => $code, "data" => $files));
die();
