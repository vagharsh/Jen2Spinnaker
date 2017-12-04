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
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link rel="stylesheet" href="lib/bootstrap-theme.min.css">
    <link rel="stylesheet" href="lib/style.css">
</head>
<body>
<div class="container" style="padding-top: 30px">
    <div class="col-md-12">
        <div class="row">
            <div class="form-group">
                <h4 class="col-sm-3 control-label">Services of the Project :</h4>
                <div class="col-sm-3">
                    <select id="projectSelector" class="form-control"></select>
                </div>
                <div class="col-sm-5">
                    <button disabled class="btn btn-primary submitButton"><?php echo $JenkinsJobShortTitle;?></button>
                    <button disabled class="btn btn-info bulkDeploySpinnaker">Bulk deploy to Spinnaker</button>
                </div>
            </div>
        </div>
        <hr>
        <div class="form-group">
            <div class="row">
                <div class="col-md-12">
                    <p class="bg-danger col-md-9 text-center"><strong>Jenkins</strong></p>
                    <p class="bg-info col-md-3 text-center"><strong>Spinnaker</strong></p>
                </div>
            </div>
        </div>
        <div class="form-group">
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
        </div>
        <div class="form-group">
            <div class="row" style="overflow-x: auto; max-height: 65vh; overflow-y: auto;">
                <form id="serviceForm">
                    <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                        <div class="progress" id="loadingArea">
                            <div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">
                                <span >Loading</span>
                            </div>
                        </div>
                        <div id="serviceList" class="panel-body hidden"></div>
                    </div>
                </form>
            </div>
        </div>
        <div class="form-group">
            <div class="row">
                <button disabled class="btn btn-primary submitButton"><?php echo $JenkinsJobShortTitle;?></button>
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
<footer id="pageFooter">
    <div class="container">
        <p class="navbar-text">Jen2Spinnaker <?php echo $jen2SpinnakerVersion; ?></p>
        <ul class="nav navbar-nav navbar-right">
            <li><a href="https://github.com/vagharsh/Jen2Spinnaker" target="_blank">GitHub Project</a></li>
        </ul>
    </div>
</footer>
<script type="text/javascript" language="javascript" src="lib/jquery-1.11.3.min.js"></script>
<script type="text/javascript" language="javascript" src="lib/bootstrap.min.js"></script>
<script type="text/javascript" language="javascript" src="lib/functions.js"></script>
<script type="text/javascript" language="javascript" src="lib/triggers.js"></script>
<script>
    $(document).ready(function () {
        var rowContent = '';
        $.ajax({
            url: 'http://localhost:8084//projects/',
            type: 'get'
        }).success(function (data) {
            data.sort(function(a, b) {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            $.each(data, function (key, item) {
                rowContent = "<option id=" + item['id'] + ">" + item['name'] + "</option>";
                $('#projectSelector').append(rowContent);
            })
            $('#projectSelector').trigger('change');
        })
    })
</script>
</body>
</html>