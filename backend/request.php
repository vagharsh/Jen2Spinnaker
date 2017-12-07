<?php
include_once('functions.php');
include_once('../config/config.php');

if ($_SERVER['REQUEST_METHOD'] === "POST"){
    // Building the jenkins job
    $image_list = trim($_POST['image_group']);
    $image_tag = trim($_POST['image_tag']);
    $returnData = [];
    foreach ($image_list as $key => $image_group) {
        // data format as needed to be sent to the Jenkins Job
        $data = "IMAGE_GROUP=".$image_group."&IMAGE_TAG=".$image_tag[$key];
        $headers = buildJob($data, $JenkinsJobUrl, $userToken);
        preg_match("!\r\n(?:Location|URI): *(.*?) *\r\n!", $headers, $matches);
        $url = $matches[1];
        $returnData[$key]['url'] = getJobUrl($url, $userToken);
        $returnData[$key]['image_group'] = $image_group;
        $returnData[$key]['image_tag'] = $image_tag[$key];
    }
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