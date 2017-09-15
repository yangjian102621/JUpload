<?php
/**
 * 从服务器上搜索图片并返回图片地址列表
 * @author yangjian<yangjian102621@gmail.com>
 */
error_reporting(0);
set_time_limit(0);
require "JsonResult.php";

$page = intval($_GET["page"]);
$kw = trim($_GET['kw']);
//$apiUrl = "http://image.baidu.com/search/avatarjson?tn=resultjsonavatarnew&ie=utf-8&word={$kw}&pn={$page}&rn=15";
$apiUrl = "http://image.so.com/j?q={$kw}&src=tab_www&sn={$page}&pn=15";
$content = file_get_contents($apiUrl);
$data = json_decode(mb_convert_encoding($content, 'UTF-8','GBK,UTF-8'), true);
//echo "<pre>";
//print_r($data);die();
$files = array();
if ( is_array($data["list"]) ) {
    foreach ( $data["list"] as $value ) {
        $filename = basename($value["thumb"]);
        array_push($files, array(
            "thumbURL" => "php/image_grap.php?img_url={$value["thumb"]}",
            "oriURL" => "php/files/".$filename,
            "width" => $value["width"],
            "height" => $value["height"]));
    }
}

$result = new JsonResult();
if (!empty($files)) {
    $result->setCode(JsonResult::CODE_SUCCESS);
    $result->setItems($files);
} else {
    $result->setCode(JsonResult::CODE_FAIL);
}
$result->output();
