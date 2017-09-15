<?php
/**
 * 获取图片服务器上已上传的图片列表
 * @author yangjian<yangjian102621@gmail.com>
 */
error_reporting(0);
require "JsonResult.php";

usleep(500000);
$page = intval($_GET["page"]);
$offset = ($page - 1) * 15;
$image_dir = dirname(__FILE__)."/files/";
$files = array();
$handler = opendir($image_dir);
if ( $handler != false ) {
    $i = 0;
    while (($filename = readdir($handler)) != false) {

        if ( $filename != "." && $filename != ".." ) {
            if ( $i < $offset ) {
                $i++;
                continue;
            }
            $size = getimagesize($image_dir.$filename);
            array_push($files, array(
                "thumbURL" => "php/files/".$filename,
                "oriURL" => "php/files/".$filename,
                "width" => intval($size[0]),
                "height" => intval($size[1])));
            $i++;
            if ( $i > ($offset + 15) ) break;
        }
    }
    closedir($handler);
}

$result = new JsonResult();
if (!empty($files)) {
    $result->setCode(JsonResult::CODE_SUCCESS);
    $result->setItems($files);
} else {
    $result->setCode(JsonResult::CODE_FAIL);
}
$result->output();
