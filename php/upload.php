<?php
/**
 * 文件上传代码，仅供参考，生产环境请重写代码
 * @author yangjian<yangjian102621@gmail.com>
 */
error_reporting(0);
require "JsonResult.php";

$result = new JsonResult(JsonResult::CODE_FAIL, "文件上传失败");
$uploadDir = dirname(__FILE__)."/files/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir);
}
//文件上传处理
if ( isset($_FILES['src']) ) {

    $localfile = $_FILES['src'];
    $filename = md5(time().$localfile['name']).get_extension($localfile['name']);
    if ( move_uploaded_file($localfile['tmp_name'], $uploadDir.$filename) ) {
        $result->setCode(JsonResult::CODE_SUCCESS);
        $result->setMessage("文件上传成功");
        $result->setItem('php/files/'.$filename);
    }
}
$result->output();

function get_extension($filename) {
    $pos = strrpos($filename, ".");
    return substr($filename,$pos);
}