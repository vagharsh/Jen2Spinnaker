function checkSubmit(){
    var btns = $('button[name*=short]'),
        btnsCount = 0;

    $.each(btns, function (key, item) {
        if ($(item).hasClass('btn-primary')){
            btnsCount++;
        }
    });
    if (btnsCount === 0){
        $('.submitButton').attr('disabled', true);
    } else {
        $('.submitButton').attr('disabled', false);
    }
}

function removeDuplicates(arr, key) {
    if (!(arr instanceof Array) || key && typeof key !== 'string') {
        return false;
    }

    if (key && typeof key === 'string') {
        return arr.filter((obj, index, arr) => {
            return arr.map(mapObj => mapObj[key]).indexOf(obj[key]) === index;
    });

    } else {
        return arr.filter(function(item, index, arr) {
            return arr.indexOf(item) == index;
        });
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

function pushToSpinnaker(service, pipeline, tag, btn, imageGroup, viewLog){
    $.ajax({
        url: 'http://localhost:8084//pipelines/' + service + '/' + pipeline,
        type: 'post',
        dataType: "json",
        contentType : "application/json",
        data: '{"type":"manual","tag":"' + tag + '","repository":"' + imageGroup + '"}'
    }).success(function (data) {
        var dataRef = data.ref;
        if (dataRef.match('pipelines')){
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
