<?php
include_once('config/config.php');
$jen2SpinnakerVersion = trim(file_get_contents('backend/version'));
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo $title; ?></title>
    <link rel="shortcut icon" href="lib/favicon.png"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="lib/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="lib/css/style.css">
</head>
<body>
<div class="container" style="padding-top: 30px">
    <div class="col-md-12">
        <div class="row">
            <div class="form-group">
                <h4 class="col-sm-2 control-label">Spinnaker Projects :</h4>
                <div class="col-sm-2">
                    <select id="projectSelector" class="form-control"></select>
                </div>

                <div class="col-sm-5">
                    <button disabled class="btn btn-primary submitButton"><?php echo $JenkinsJobShortTitle; ?></button>
                    <button disabled class="btn btn-info bulkDeploySpinnaker">Bulk deploy to Spinnaker</button>
                </div>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-12">
                <p class="bg-danger col-md-9 text-center">Jenkins</p>
                <p class="bg-info col-md-3 text-center">Spinnaker</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-2">
                <label>Service Name</label>
            </div>
            <div class="col-md-1">
                <label>Image Tag</label>
            </div>
            <div class="col-md-4">
                <label>Image Group to be pushed</label>
            </div>
            <div class="col-md-1">
                <label>Status</label>
            </div>
            <div class="col-md-1">
                <label>Pushed</label>
            </div>
            <div class="col-md-2">
                <label>Deploy to Spinnaker</label>
            </div>
            <div class="col-md-1">
                <label>Logs</label>
            </div>
        </div>
        <div class="form-group">
            <div class="row" style="overflow-x: auto; max-height: 65vh; overflow-y: auto;">
                <form id="serviceForm">
                    <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                        <div class="progress" id="loadingArea">
                            <div id="progressDiv" class="progress-bar progress-bar-info" role="progressbar"
                                 aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
                                <span>Loading</span>
                            </div>
                        </div>
                        <div id="serviceList" class="panel-body hidden"></div>
                    </div>
                </form>
            </div>
        </div>
        <div class="form-group">
            <div class="row">
                <button disabled class="btn btn-primary submitButton"><?php echo $JenkinsJobShortTitle; ?></button>
                <button disabled class="btn btn-info bulkDeploySpinnaker">Bulk deploy to Spinnaker</button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" tabindex="-1" role="dialog" id="logsModal">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content well" id="logArea"></div>
    </div>
</div>
<div class="modal fade" id="connectingModalId" tabindex="-1" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <p class="text-center">Establishing connection with <strong>localhost:8084</strong></p>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="noConnectionModalId" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header modal-header-danger">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span>&times;</span>
                </button>
                <h4 class="modal-title"><strong>No Connection</strong></h4>
            </div>
            <div class="modal-body text-center">
                <span>Make sure your connection tunnel with port <strong>8084</strong> to <strong>Spinnaker</strong> is working and then try again.</span>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
<footer id="pageFooter">
    <div class="container">
        <p class="navbar-text">Jen2Spinnaker <?php echo $jen2SpinnakerVersion; ?></p>
        <ul class="nav navbar-nav navbar-right">
            <li><a href="https://github.com/vagharsh/Jen2Spinnaker" target="_blank">GitHub Project</a></li>
        </ul>
    </div>
</footer>
<script type="text/javascript" language="javascript" src="lib/js/jquery-1.11.3.min.js"></script>
<script type="text/javascript" language="javascript" src="lib/js/bootstrap.min.js"></script>
<script type="text/javascript" language="javascript" src="lib/js/functions.js"></script>
<script type="text/javascript" language="javascript" src="lib/js/triggers.js"></script>
<script>
    $(document).ready(function () {
        $('#connectingModalId').modal('show');

        $.ajax({
            url: 'http://localhost:8084//projects/',
            type: 'HEAD'
        }).success(function (message, text, jqXHR) {
            $('#connectingModalId').modal('hide');
            if (jqXHR.status === 200) {
                getProjects();
            } else {
                $('#noConnectionModalId').modal('show');
            }
        }).error(function (message) {
            if (message.statusText === 'error') {
                $('#connectingModalId').modal('hide');
                $('#noConnectionModalId').modal('show');
            }
        })
    })
</script>
</body>
</html>