$('#projectSelector').on('change', function (){
    $('#loadingArea').removeClass('hidden');
    $('#serviceList').addClass('hidden');
    $('#serviceList').empty();

    $(".deployToSpinnaker").unbind('click');
    $(".bulkDeploySpinnaker").unbind('click');
    $(".svcBtnEnabler").unbind('click');
    $(".submitButton").unbind('click');

    var selected_id = $(this).children(":selected").attr("id");
    $.ajax({
        url: "http://localhost:8084//projects/" + selected_id + "/pipelines?limit=&statuses=",
        type: 'get'
    }).success(function (data) {
        var contextListArr = [];
        $.each(data, function (key, item) {
            var contextListObj = {};
            contextListObj['repository'] = item['stages'][0]['context']['containers'][0]['imageDescription']['repository'];
            contextListObj['application'] = item['application'];
            contextListObj['id'] = item['id'];
            contextListObj['name'] = item['name'];
            contextListObj['config_Id'] = item['pipelineConfigId'];
            contextListArr.push(contextListObj)
        });
        var filteredSvc = removeDuplicates(contextListArr, 'config_Id');
            filteredSvc.sort(function(a, b) {
                var textA = a.application.toUpperCase();
                var textB = b.application.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
        $.each(filteredSvc, function (key, item) {
            var pipeline = item['name'],
                pipelineId = item['id'],
                repository = item['repository'],
                application_name = item['application'],
                rowContent = "\
                <div class=\"form-group\">\
                    <div class=\"row\">\
                        <div class=\"col-md-2\">\
                            <button class=\"btn btn-default svcBtnEnabler btn-block\" type=\"button\" name=\"short\" data-toggle=\"button\" aria-pressed=\"false\"><span class=\"pull-left\">" + application_name + "</span></button>\
                        </div>\
                        <div class=\"col-md-1\">\
                            <input class=\"form-control editableField tagField\" required name=\"image_tag[]\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"This field is required\" placeholder=\"Tag\" disabled>\
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
        });

        $('.retrieveLogs').on('click', function (e){
            e.preventDefault();
            e.stopPropagation();
            var logRetrieve,
                logsModal = $('#logsModal'),
                pipelineId = $(this).parent().prev().find('button').attr('data-pipeline-id');

            logsModal.modal('show');

            logRetrieve = setInterval(function (){
                getPipelineLogs(pipelineId)
            }, 2000);

            logsModal.on('hidden.bs.modal', function (e) {
                clearInterval(logRetrieve);
            });
        })
        $('.submitButton').on('click', function() {
            //$('.editableField').attr('readonly', true);
            if (validateForm()){
                $.ajax({
                    url: 'backend/request.php',
                    type: 'post',
                    data: $('#serviceForm').serialize()
                }).done(function (data) {
                    var parsedJson = JSON.parse(data);
                    $.each(parsedJson, function (key, item) {
                        getStatus(item);
                    })
                });
            } else {
                return false;
            }
        });

        $('.bulkDeploySpinnaker').on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            var checkboxes = $('.checkbox-inp');

            $.each(checkboxes, function (key, checkbox){
                if ($(checkbox).attr('checked') === 'checked') {
                    var spinnakerBtn = $(checkbox).parent().parent().next(),
                        service_name = $(checkbox).parent().parent().prev().prev().prev().prev().find('span').text(),
                        imageGroupInp = $(checkbox).parent().parent().prev().prev().find('input').val(),
                        pipeline = spinnakerBtn.find('.deployToSpinnaker').attr('data-pipeline'),
                        input_tag = $(checkbox).parent().parent().prev().prev().prev().find('input').val();

                    setTimeout(function(){
                         pushToSpinnaker(service_name, pipeline, input_tag, spinnakerBtn.find('.deployToSpinnaker'), imageGroupInp, false);
                    }, 1000);
                }
            })
        })
        $('.checkbox-btn').on('click', function (e){
            e.preventDefault();
            e.stopPropagation();
            var checkbox = $(this).find('.checkbox-inp');
            checkbox.prop("checked", !checkbox.prop("checked"));
            checkbox.attr("checked", !checkbox.attr("checked"));
            enableBulkDeploy();
            checkBoxBtnBehaviour($(this));
        });
        $('.deployToSpinnaker').on('click', function (e){
            e.preventDefault();
            e.stopPropagation();
            var spinnakerBtn = $(this),
                service_name = $(this).parent().prev().prev().prev().prev().prev().find('span').text(),
                imageGroupInp = $(this).parent().prev().prev().prev().find('input').val(),
                pipeline = $(this).attr('data-pipeline'),
                input_tag = $(this).parent().prev().prev().prev().prev().find('input').val();

            pushToSpinnaker(service_name, pipeline, input_tag, spinnakerBtn, imageGroupInp, true);
        });
        $('.svcBtnEnabler').click(function (){
            var imageTag = $(this).parent().next().children(),
                imageGroupInp = $(this).parent().next().next().children(),
                pushedImageCheck = $(this).parent().next().next().next().next(),
                spinnakerLogBtn =  $(this).parent().next().next().next().next().next().next();

            if (imageTag.attr('disabled')) {
                imageTag.removeAttr('disabled');
                imageGroupInp.removeAttr('disabled');
                $(this).removeClass('btn-default');
                $(this).addClass('btn-primary');

                //enable Spinnaker Log button
                $(spinnakerLogBtn.find('a')).insertAfter(spinnakerLogBtn.find('button'));
                spinnakerLogBtn.find('a').addClass('hidden');
                spinnakerLogBtn.find('button').removeClass('hidden');
            } else {
                imageTag.val('');
                imageTag.attr('disabled', true);
                imageGroupInp.attr('disabled', true);
                $(this).removeClass('btn-primary');
                $(this).addClass('btn-default');
                pushedImageCheck.find('a').addClass('disabled');
                pushedImageCheck.find('input').prop("checked", false);
                pushedImageCheck.find('input').attr("checked", false);
                checkBoxBtnBehaviour(pushedImageCheck.find('a'))
                enableBulkDeploy();
                //disable Spinnaker Log button
                $(spinnakerLogBtn.find('button')).insertAfter(spinnakerLogBtn.find('a'));
                spinnakerLogBtn.find('a').removeClass('hidden');
                spinnakerLogBtn.find('button').addClass('hidden');
            }
            checkSubmit();
        });
        $('.tagField').keyup(function (){
            var pushedImageCheck = $(this).parent().next().next().next(),
                imageTag = $(this).val();

            if (imageTag.length > 0){
                pushedImageCheck.find('a').removeClass('disabled');
            } else {
                pushedImageCheck.find('input').prop("checked", false);
                pushedImageCheck.find('input').attr("checked", false);
                pushedImageCheck.find('a').addClass('disabled');
            }
            checkBoxBtnBehaviour(pushedImageCheck.find('a'))
        });
        $('#serviceList').removeClass('hidden');
        $('#loadingArea').addClass('hidden');
    })
});
