$('#projectSelector').on('change', function () {
    $('#loadingArea').removeClass('hidden');
    $('#serviceList').addClass('hidden');
    $('#serviceList').empty();
    $('#progressDiv').attr('aria-valuenow', 0).css('width', '0%');

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
                url: "http://localhost:8084//applications/" + item['application'] + "/pipelineConfigs/",
                type: 'get'
            }).success(function (pipelineConfigs) {
                $.each(pipelineConfigs, function (key, pipelineConfig) {
                    if (pipelineConfig['id'] === item['pipelineConfigId']) {
                        pipelinesList['id'] = pipelineConfig['id'];
                        pipelinesList['name'] = pipelineConfig['name'];
                        pipelinesList['application'] = pipelineConfig['application'];
                        pipelinesList['pipelineConfigId'] = item['pipelineConfigId'];
                        pipelinesList['repository'] = pipelineConfig['stages'][0]['clusters'][0]['containers'][0]['imageDescription']['repository'];
                        count++;
                        getPipelines(pipelinesList, applications_count, count);
                    }
                })
            })
        })
    })
});
$('#progressDiv').on('change', function () {
    if ($(this).attr('aria-valuenow') == 100) {
        window.setTimeout(function () {
            /*$('.retrieveLogs').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var logRetrieve,
                    logsModal = $('#logsModal'),
                    pipelineId = $(this).parent().prev().find('button').attr('data-pipeline-id');

                logsModal.modal('show');

                logRetrieve = setInterval(function () {
                    //getPipelineLogs(pipelineId)
                }, 2000);

                logsModal.on('hidden.bs.modal', function (e) {
                    //clearInterval(logRetrieve);
                });
            })*/
            $('.submitButton').on('click', function () {
                var btn, tag, name,
                    btns = $('button[name*=short]'),
                    result = [];
                if (validateForm()) {
                    $.each(btns, function (key, item) {
                        if ($(item).hasClass('btn-primary')) {
                            btn = $(item);
                            tag = btn.parent().next().find('input').val();
                            name = btn.parent().next().next().find('input').val();
                            result.push({
                                image_tag: tag,
                                image_group: name
                            });
                        }
                    });

                    $.each(result, function (key, item) {
                        $.ajax({
                            url: 'backend/request.php',
                            type: 'post',
                            data: item
                        }).done(function (data) {
                            var parsedJson = JSON.parse(data);
                            getStatus(parsedJson);
                        });
                    })

                } else {
                    return false;
                }
            });
            $('.bulkDeploySpinnaker').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var checkboxes = $('.checkbox-inp');

                $.each(checkboxes, function (key, checkbox) {
                    if ($(checkbox).attr('checked') === 'checked') {
                        var spinnakerBtn = $(checkbox).parent().parent().next(),
                            service_name = $(checkbox).parent().parent().prev().prev().prev().prev().find('span').text(),
                            imageGroupInp = $(checkbox).parent().parent().prev().prev().find('input').val(),
                            pipeline = spinnakerBtn.find('.deployToSpinnaker').attr('data-pipeline'),
                            input_tag = $(checkbox).parent().parent().prev().prev().prev().find('input').val();

                        setTimeout(function () {
                            pushToSpinnaker(service_name.trim(), pipeline.trim(), input_tag.trim(), imageGroupInp.trim(), spinnakerBtn.find('.deployToSpinnaker'), false);
                        }, 1000);
                    }
                })
            })
            $('.checkbox-btn').on('click', function (e, source) {
                e.preventDefault();
                e.stopPropagation();
                if (!$(this).hasClass('disabled')) {
                    var checkbox = $(this).find('.checkbox-inp');
                    if (e.originalEvent === undefined) {
                        //console.log(source);
                        if (source.id === 'selectAllPushedId') {
                            if ($(source).hasClass('glyphicon-unchecked')) {
                                checkbox.prop("checked", true);
                                checkbox.attr("checked", true);
                            }
                            if ($(source).hasClass('glyphicon-check')) {
                                checkbox.prop("checked", false);
                                checkbox.attr("checked", false);
                            }
                        }
                        checkbox.prop("checked", !checkbox.prop("checked"));
                        checkbox.attr("checked", !checkbox.attr("checked"));
                        enableBulkDeploy();
                        checkBoxBtnBehaviour($(this));
                    } else {
                        checkbox.prop("checked", !checkbox.prop("checked"));
                        checkbox.attr("checked", !checkbox.attr("checked"));
                        enableBulkDeploy();
                        checkBoxBtnBehaviour($(this));
                    }
                }
            });
            $('.deployToSpinnaker').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var spinnakerBtn = $(this),
                    service_name = $(this).parent().prev().prev().prev().prev().prev().find('span').text(),
                    imageGroupInp = $(this).parent().prev().prev().prev().find('input').val(),
                    pipeline = $(this).attr('data-pipeline'),
                    input_tag = $(this).parent().prev().prev().prev().prev().find('input').val();

                pushToSpinnaker(service_name.trim(), pipeline.trim(), input_tag.trim(), imageGroupInp.trim(), spinnakerBtn, true);
            });
            $('.svcBtnEnabler').on('click', function (e, source) {
                e.preventDefault();
                e.stopPropagation();
                var imageTag = $(this).parent().next().children(),
                    imageGroupInp = $(this).parent().next().next().children(),
                    pushedImageCheck = $(this).parent().next().next().next().next(),
                    spinnakerLogBtn = $(this).parent().next().next().next().next().next().next(),
                    svcCheckAll = $('#selectAllSvcId'),
                    that = $(this);

                if (e.originalEvent === undefined) {
                    if (svcCheckAll.hasClass('glyphicon-check')) {
                        svcEnablerFn(true, imageTag, imageGroupInp, that, pushedImageCheck, spinnakerLogBtn)
                    }
                    if (svcCheckAll.hasClass('glyphicon-unchecked')) {
                        svcEnablerFn(false, imageTag, imageGroupInp, that, pushedImageCheck, spinnakerLogBtn)
                    }
                } else {
                    if (imageTag.attr('disabled')) {
                        svcEnablerFn(true, imageTag, imageGroupInp, that, pushedImageCheck, spinnakerLogBtn)
                    } else {
                        svcEnablerFn(false, imageTag, imageGroupInp, that, pushedImageCheck, spinnakerLogBtn)
                    }
                }

                if (source === 'json') {
                    if (imageTag.attr('disabled')) {
                        svcEnablerFn(true, imageTag, imageGroupInp, that, pushedImageCheck, spinnakerLogBtn)
                    } else {
                        svcEnablerFn(false, imageTag, imageGroupInp, that, pushedImageCheck, spinnakerLogBtn)
                    }
                }
                checkSubmit();
            });
            $('.tagField').on('keyup', function () {
                var pushedImageCheck = $(this).parent().next().next().next(),
                    imageTag = $(this).val();

                if (imageTag.length > 0) {
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

$('#selectAllPushedId').on('click', function () {
    var span = $(this);
    if (!span.hasClass('disabled')) {
        if (span.hasClass('glyphicon-unchecked')) {
            span.removeClass('glyphicon-unchecked');
            span.addClass('glyphicon-check');
        } else {
            span.removeClass('glyphicon-check');
            span.addClass('glyphicon-unchecked');
        }
        $('.checkbox-btn').trigger('click', span);
    }
})

$('#selectAllSvcId').on('click', function () {
    var span = $(this);

    if (span.hasClass('glyphicon-unchecked')) {
        span.removeClass('glyphicon-unchecked');
        span.addClass('glyphicon-check');
    } else {
        span.removeClass('glyphicon-check');
        span.addClass('glyphicon-unchecked');
    }
    $('.svcBtnEnabler ').trigger('click');
})

$('#importJSONBtnId').on('click', function () {
    var files = document.getElementById('jsonInputFile').files,
        allSvcButtons = $('.svcBtnEnabler'),
        fr = new FileReader();

    if (files.length <= 0) {
        alert('JSON file must be selected first.');
        return false;
    } else {
        fr.onload = function (e) {
            var result = JSON.parse(e.target.result);
            $.each(result, function (key, item) {
                var loweredTrimmedKey = key.toLowerCase().trim();
                $('.svcBtnEnabler').each(function (i, btn) {
                    var svcName = $(btn).find('span').text().toLowerCase().trim();
                    if (svcName === loweredTrimmedKey) {
                        $(btn).trigger('click', 'json');
                        $(btn).parent().next().find('input').val(item);
                        $(btn).parent().next().find('input').trigger('keyup');
                    }
                });
            })
        };
    }
    fr.readAsText(files.item(0));
    $('#importJSONModalId').modal('hide');
});