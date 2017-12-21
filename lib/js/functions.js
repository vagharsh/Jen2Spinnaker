function checkSubmit(){
    var btns = $('button[name*=short]'),
        btnsCount = 0,
        pushedCheckBoxALl = $('#selectAllPushedId');

    $.each(btns, function (key, item) {
        if ($(item).hasClass('btn-primary')){
            btnsCount++;
        }
    });
    if (btnsCount === 0){
        $('.submitButton').attr('disabled', true);
        pushedCheckBoxALl.addClass('disabled');
        pushedCheckBoxALl.removeClass('glyphicon-check');
        pushedCheckBoxALl.addClass('glyphicon-unchecked');
    } else {
        $('.submitButton').attr('disabled', false);
        pushedCheckBoxALl.removeClass('disabled');
    }
}

function validateForm (){
    var elems = $('input[name*=image_tag]'),
        emptyTags = 0;

    $.each(elems, function (key, item) {
        if ($(item).val().length <= 0){
            if ($(item).parent().prev().children().hasClass('btn-primary')){
                $(item).tooltip('show');
                emptyTags++
            }
        }
    });

    if (emptyTags === 0){
        var btns = $('button[name*=short]');
        $.each(btns, function (key, item) {
            if ($(item).hasClass('active')){
                $(item).parent().next().next().next().find('span').addClass('glyphicon-spin');
                $(item).parent().next().next().next().find('a').removeClass('btn-default');
                $(item).parent().next().next().next().find('a').addClass('btn-warning');
            }
        });
        return true;
    } else {
        return false;
    }
}

function getStatus(data){
    $.ajax({
        url: 'backend/request.php',
        type: 'get',
        data:  {
            data :data,
            method : 'getStatus'
        }
    }).done(function (res) {
        var parsedData = JSON.parse(res);
        if (parsedData['status'] !== "SUCCESS" && parsedData['status'] !== "FAILURE"){
            setTimeout(function () {
                getStatus(data);
            }, 2500);
        } else {
            var imgGroups = $('.image_group');
            $.each(imgGroups, function (key, item) {
                if ($(item).val() === parsedData['image_group']) {
                    $(item).parent().next().find('span').removeClass('glyphicon-refresh');
                    $(item).parent().next().find('span').removeClass('glyphicon-spin');
                    $(item).parent().next().find('a').removeClass('btn-warning');
                    if (parsedData['status'] === "SUCCESS"){
                        $(item).parent().next().find('span').addClass('glyphicon-ok');
                        $(item).parent().next().find('a').addClass('btn-success');
                        $(item).parent().next().next().find('.checkbox-btn').trigger('click');
                    } else if (parsedData['status'] === "FAILURE"){
                        $(item).parent().next().find('span').addClass('glyphicon-remove');
                        $(item).parent().next().find('a').addClass('btn-danger');
                    }
                }
            });
        }
    });
}
function enableBulkDeploy(){
    if (getCheckedCheckboxes() > 0){
        $('.bulkDeploySpinnaker').attr('disabled', false);
    } else {
        $('.bulkDeploySpinnaker').attr('disabled', true);
    }
}

function getCheckedCheckboxes(){
    var checkboxes = $('.checkbox-btn').find('input'),
        checkedCount = 0

    $.each(checkboxes, function (key, checkbox){
        if ($(checkbox).is(':checked')) {
            checkedCount++
        }
    })
    return checkedCount;
}

function enableSpinnaker(item, enable){
    // the item should be provided the spinnaker button row
    if (enable){
        //Spinnaker Deploy button
        $(item.find('a')).insertAfter(item.find('button'));
        item.find('a').addClass('hidden');
        item.find('button').removeClass('hidden');
    } else {
        //Spinnaker Deploy button
        $(item.find('button')).insertAfter(item.find('a'));
        item.find('a').removeClass('hidden');
        item.find('button').addClass('hidden');
    }
}

function getPipelineLogs(id){
    $.ajax({
        url: 'http://localhost:8084//pipelines/' + id + '/logs',
        type: 'get'
    }).success(function (log) {
        insetLogToField(log)
    })
}

function insetLogToField(log){
    var logLine ='',
        logArea = $('#logArea'),
        preClass;
    logArea.html("");
    log.reverse();
    $.each(log, function (key, item) {
        switch (item['eventType']){
            case "ExecutionStarted" : preClass = "bg-info"; break;
            case "ExecutionComplete" : preClass = "bg-success"; break;
            case "StageStarted" : preClass = "bg-info"; break;
            case "StageComplete" : preClass = "bg-success"; break;
            case "TaskStarted" : preClass = "bg-info"; break;
            case "TaskComplete" : preClass = "bg-success"; break;
            default : preClass = '';
        }

        var date = new Date(item['timestamp']);
        logLine += "<pre class=\"" +preClass+ "\">" + date.toString().slice(0, 24) + " --> " + item['details']['name'] + " --> " + item['eventType'] + "</pre>";
    })
    logArea.append(logLine)
}

function checkBoxBtnBehaviour(obj){
    var checkbox = obj.find('input'),
        checkboxSpan = obj.find('span');

    if (checkbox.is(':checked')) {
        checkboxSpan.removeClass('glyphicon-unchecked');
        checkboxSpan.addClass('glyphicon-check');
        enableSpinnaker(obj.parent().next(), true);
    } else {
        checkboxSpan.removeClass('glyphicon-check');
        checkboxSpan.addClass('glyphicon-unchecked');
        enableSpinnaker(obj.parent().next(), false);
    }
}

function pushToSpinnaker(service, pipeline, tag, imageGroup, btn, viewLog){
    var spinnakerLogBtn = btn.parent().next();
    $.ajax({
        url: 'http://localhost:8084//pipelines/' + service + '/' + pipeline,
        type: 'post',
        dataType: "json",
        contentType : "application/json",
        data: '{"type":"manual","tag":"' + tag + '","repository":"' + imageGroup + '"}'
    }).success(function (data) {
        var dataRef = data.ref;
        if (dataRef.match('pipelines')){
            SpinnakerLogBtnBehaviour(spinnakerLogBtn, 'enable')
            btn.attr('data-pipeline-id', dataRef.replace('/pipelines/', ''));
            if (viewLog){
                btn.parent().next().find('.retrieveLogs').trigger('click');
            }
            btn.removeClass('btn-primary');
            btn.addClass('btn-success');
        } else {
            btn.addClass('hidden');
            btn.prev().removeClass('hidden');
            btn.prev().text('');
            btn.prev().removeClass('btn-primary');
            btn.prev().addClass('btn-danger');
            btn.prev().html('<span class="glyphicon glyphicon-remove"></span>');
        }
    })
}

function SpinnakerLogBtnBehaviour(btnGroup, status){
    if (status === 'enable'){
        if (btnGroup.find('button').hasClass('hidden')){
            $(btnGroup.find('a')).insertAfter(btnGroup.find('button'));
            btnGroup.find('a').addClass('hidden');
            btnGroup.find('button').removeClass('hidden');
        }
    } else if (status === 'disable') {
        if (! btnGroup.find('button').hasClass('hidden')) {
            $(btnGroup.find('button')).insertAfter(btnGroup.find('a'));
            btnGroup.find('a').removeClass('hidden');
            btnGroup.find('button').addClass('hidden');
        }
    }
}

function changeProgress(total, now){
    var progress = $('#progressDiv'),
        nowPercent = now * 100,
        percent = Math.ceil(nowPercent / total);

    if (percent > 100){percent = 100}
    progress.attr('aria-valuenow', percent).css('width',percent+'%');
    progress.trigger('change');
}

function getPipelines(pipelineConfig, applications_count, count){
    $(".retrieveLogs").unbind('click');
    $(".submitButton").unbind('click');
    $(".bulkDeploySpinnaker").unbind('click');
    $(".checkbox-btn").unbind('click');
    $(".deployToSpinnaker").unbind('click');
    $(".svcBtnEnabler").unbind('click');
    $(".tagField").unbind('click');

    var pipeline = pipelineConfig['name'],
        pipelineId = pipelineConfig['id'],
        pipelineConfigId = pipelineConfig['pipelineConfigId'],
        repository = pipelineConfig['repository'],
        application_name = pipelineConfig['application'],
        rowContent = "\
            <div class=\"form-group\">\
                <div class=\"row\">\
                    <div class=\"col-md-2\">\
                        <button class=\"btn btn-default svcBtnEnabler btn-block\" type=\"button\" name=\"short\" data-toggle=\"button\" aria-pressed=\"false\"><span class=\"pull-left\">" + application_name + "</span></button>\
                    </div>\
                    <div class=\"col-md-1\">\
                        <input class=\"form-control editableField tagField\" required name=\"image_tag[]\" data-toggle=\"tooltip\" data-placement=\"right\" title=\"This field is required\" placeholder=\"Tag\" disabled>\
                    </div>\
                    <div class=\"col-md-4\">\
                        <input class=\"form-control editableField image_group\" name=\"image_group[]\" disabled value='" + repository + "'>\
                    </div>\
                    <div class=\"col-md-1\">\
                        <a href=\"#\" class=\"btn btn-default btn-block disabled\" role=\"button\"><span class='glyphicon glyphicon-refresh'></span></a>\
                    </div>\
                    <div class=\"col-md-1\">\
                        <a href=\"#\" class=\"btn btn-default btn-block disabled checkbox-btn\" role=\"button\">\
                            <span class='glyphicon glyphicon-unchecked'></span>\
                            <input class='checkbox-inp hidden' type=\"checkbox\">\
                        </a>\
                    </div>\
                    <div class=\"col-md-2\">\
                        <a href=\"#\" class=\"btn btn-primary btn-block disabled\" role=\"button\">Deploy to Spinnaker</a>\
                        <button class=\"btn btn-primary btn-block hidden deployToSpinnaker\" data-pipeline-id=\"" + pipelineId + "\" data-pipeline=\"" + pipeline + "\">Deploy to Spinnaker</button>\
                    </div>\
                    <div class=\"col-md-1\">\
                        <a href=\"#\" class=\"btn btn-warning btn-block disabled\" role=\"button\"><span class='glyphicon glyphicon-menu-hamburger'></span></a>\
                        <button class=\"btn btn-warning btn-block hidden retrieveLogs\"><span class='glyphicon glyphicon-menu-hamburger'></span></button>\
                    </div>\
                </div>\
            </div>";
    $('#serviceList').append(rowContent);
    changeProgress(applications_count, count)
}

function getProjects(){
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
}

function svcEnablerFn(status, imageTag, imageGroupInp, that, pushedImageCheck, spinnakerLogBtn) {
    if (status) {
        that.removeClass('btn-default');
        that.addClass('btn-primary');
        imageTag.removeAttr('disabled');
        imageGroupInp.removeAttr('disabled');
    } else {
        that.removeClass('btn-primary');
        that.addClass('btn-default');
        imageTag.val('');
        imageTag.attr('disabled', true);
        imageGroupInp.attr('disabled', true);
        pushedImageCheck.find('a').addClass('disabled');
        pushedImageCheck.find('input').prop("checked", false);
        pushedImageCheck.find('input').attr("checked", false);
        checkBoxBtnBehaviour(pushedImageCheck.find('a'))
        enableBulkDeploy();
        SpinnakerLogBtnBehaviour(spinnakerLogBtn, 'disable')
    }
}