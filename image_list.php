<?php
/**
 * 获取图片服务器上已上传的图片列表
 * @author yangjian<yangjian102621@gmail.com>
 */
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
            $size = getimagesize("files/".$filename);
            array_push($files, array("thumbURL" => "files/".$filename, "oriURL" => "files/".$filename,
                "width" => $size[0], "height" => $size[1]));
            $i++;
            if ( $i > $offset + 15 ) break;
        }
    }
}
$code = empty($files) ? 1 : 0;
echo json_encode(array("code" => $code, "data" => $files));
die();
