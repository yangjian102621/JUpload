<?php
header("Content-Type:text/html; charset=UTF-8");
$data = array("code" => 1, "message" => "文件上传失败");
//文件上传处理
if ( isset($_FILES['src']) ) {

    $localfile = $_FILES['src'];
    if ( move_uploaded_file($localfile['tmp_name'], __DIR__.'/files/'.$localfile['name']) ) {
        $data["code"] = 0;
        $data["message"] = '/files/'.$localfile['name'];
    }
}
echo json_encode($data);
die();
