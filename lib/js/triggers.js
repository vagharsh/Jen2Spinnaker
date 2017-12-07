$('#projectSelector').on('change', function (){
    $('#loadingArea').removeClass('hidden');
    $('#serviceList').addClass('hidden');
    $('#serviceList').empty();
    $('#progressDiv').attr('aria-valuenow', 0).css('width','0%');

    var selected_id = $(this).children(":selected").attr("id");
    $.ajax({
        url: "http://localhost:8084//projects/" + selected_id,
        type: 'get'
    }).success(function (data) {
        var project_applications = data['config']['pipelineConfigs'],
            count = 0, applications_count = project_applications.length;
        $.each(project_applications, function (key, item) {
            var pipelinesList = {};
            $.ajax({
                url: "http://localhost:8084//applications/"+ item['application'] +"/pipelineConfigs/",
                type: 'get'
            }).success(function (pipelineConfigs) {
                $.each(pipelineConfigs, function (key, pipelineConfig) {
                    if (pipelineConfig['id'] === item['pipelineConfigId']){
                        pipelinesList['id'] = pipelineConfig['id'];
                        pipelinesList['name'] = pipelineConfig['name'];
                        pipelinesList['application'] = pipelineConfig['application'];
                        pipelinesList['pipelineConfigId'] = item['pipelineConfigId'];
                        pipelinesList['repository'] = pipelineConfig['stages'][0]['clusters'][0]['containers'][0]['imageDescription']['repository'];
                        count++;
                        getPipelines(pipelinesList, applications_count , count);
                    }
                })
            })
        })
    })
});
$('#progressDiv').on('change', function (){
    if ($(this).attr('aria-valuenow') == 100){
        window.setTimeout(function() {
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
                            pushToSpinnaker(service_name.trim(), pipeline.trim(), input_tag.trim(), imageGroupInp.trim(), spinnakerBtn.find('.deployToSpinnaker'), false);
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

                pushToSpinnaker(service_name.trim(), pipeline.trim(), input_tag.trim(), imageGroupInp.trim(), spinnakerBtn, true);
            });
            $('.svcBtnEnabler').on('click', function (){
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
            //SpinnakerLogBtnBehaviour(spinnakerLogBtn, 'enable')
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
            SpinnakerLogBtnBehaviour(spinnakerLogBtn, 'disable')
            }
            checkSubmit();
            });
            $('.tagField').on('keyup', function (){
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
        }, 400);
    }
});