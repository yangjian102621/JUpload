<?php
header("Content-Type:text/html; charset=UTF-8");
$data = array("code" => 1, "message" => "http://t1.mmonly.cc/mmonly/2011/201105/135/1.jpg");
echo json_encode($data);
die();
//文件上传处理
if ( isset($_FILES['src']) ) {

    print_r($_FILES['src']);

    $localfile = $_FILES['src'];
    if ( move_uploaded_file($localfile['tmp_name'], __DIR__.'/files/'.$localfile['name']) ) {
        die('文件上传成功');
    }
}
//die('文件上传失败');
