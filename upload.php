<?php
header("Content-Type:text/html; charset=UTF-8");
$data = array("code" => 1, "message" => "文件上传失败");
echo json_encode($_FILES);die();
//文件上传处理
if ( isset($_FILES['src']) ) {

    $localfile = $_FILES['src'];
    $filename = md5(time().$localfile['name']).get_extension($localfile['name']);
    if ( move_uploaded_file($localfile['tmp_name'], __DIR__."/files/".$filename) ) {
        $data["code"] = 0;
        $data["message"] = 'files/'.$filename;
    }
}
echo json_encode($data);
die();

function get_extension($filename) {
    $pos = strrpos($filename, ".");
    return substr($filename,$pos);
}