<?php
include_once('functions.php');
include_once('../config/config.php');

if ($_SERVER['REQUEST_METHOD'] === "POST"){
    // Building the jenkins job
    $image_group = $_POST['image_group'];
    $image_tag = $_POST['image_tag'];
    $returnData = [];

    $image_group = trim($image_group);
    $image_tag = trim($image_tag);

    $data = "IMAGE_GROUP=" . $image_group . "&IMAGE_TAG=" . $image_tag;

    $headers = buildJob($data, $JenkinsJobUrl, $userToken);
    preg_match("!\r\n(?:Location|URI): *(.*?) *\r\n!", $headers, $matches);
    $url = $matches[1];
    $returnData['url'] = getJobUrl($url, $userToken);
    $returnData['image_group'] = $image_group;
    $returnData['image_tag'] = $image_tag;
    echo json_encode($returnData);
} elseif ($_SERVER['REQUEST_METHOD'] === "GET"){
    if ($_GET['method'] === 'getStatus'){
        if (isset($_GET['data']['image_group'])){
            $returnData['image_group'] = $_GET['data']['image_group'];
            $returnData['status'] = getJobStatus($_GET['data']['url'], $userToken);
            echo json_encode($returnData);
        }
    }
}