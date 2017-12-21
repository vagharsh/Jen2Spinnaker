# Jen2Spinnaker

- Jenkins to Spinnaker (Build and Deploy UI)
- A UI that helps you move your **Micro-service** images from your local registry to production and deploy them using Spinnaker. 

**Used Technologies:** JS, HTML, CSS, PHP, JQuery, Twitter Bootstrap.

-----------------
How  it works
----
The application is based on Spinnaker Projects, it gets the already setup Projects, and it's pipelines amd show them.

Using the application you will be able to
 - Select the needed services,
 - Provide it's image tag that you want to move from your local registry to the production.
 - Push them all (Bulk) using a Jenkins Pipeline Job.
   - If your image is already pushed you can click on the pushed checkbox and proceed to the next step.
 - Push your image tag to the Spinnaker Pipeline and start manual execution process and get it's task logs. 
 - View the logs of the latest pipeline that was run.

The application shows you the status of your Jenkins Job 
- Success - Green
- Running - Yellow
- Fail - Red

Need to know
----
- All the request to the Spinnaker are sent form the **Client Side** using AJAX request therefore the tunnel should be setup on the client who is using the UI.
- All the requests to the Jenkins are sent from the **Backend** therefore a working connection should be available between the Jenkins server and the server which is hosting Jen2Spinnaker. 

   
Demo
------
![Dashboard](https://image.ibb.co/ifZsh6/dashboard.png "Dashboard")

Quick Start
-----------
- To use the Jen2Spinnaker you need:
  - **[WEB]** PHP and a web server.
  - **[Jenkins]** Valid Jenkins Job to move the images from Local registry to Production, with 2 parameters.
    - IMAGE_TAG
     - IMAGE_GROUP
  - **[Jenkins]** Valid User and Token to run that Jenkins Job.
  - **[Spinnaker]** A connection tunnel on port 8084 to the Spinnaker server. 
  - **[Spinnaker]** Valid Projects inside Spinnaker with already setup pipelines.
  - **[Spinnaker]** Your docker registry image tag in the pipeline should be configured with `${trigger['tag']}`.

- Clone the repo into your web directory.
- Configure the `config/config.php` as mentioned [here](#configuration-configconfigphp).
- Access the consul-tree e.g. http://yourserver/Jen2Spinnaker

Configuration *`config/config.php`*
------------------
```php
<?php

$JenkinsJobShortTitle = "Move images to Prod-Registry";
$JenkinsJobUrl = "https://jenkins.local.com/job/k8s-clusters/job/move-image/";
$userToken = "vagharsh.kandilian:abz123456789940309z1234567898000";
$title = "Deploy Micro-Services";
```
- `$JenkinsJobShortTitle` : This will be used as the Jenkins Build job button text.
- `$JenkinsJobUrl` : Jenkins Job URL.
- `$userToken` : the username and the user's token which has the necessary permissions to build this job.
- `$title` : Application Title.

Release Notes
---------
v 1.3
- Added feature : Import service tags from JSON file.
- Added feature : Check all services buttons, check all pushed checkboxes.

Release notes are available [here](release.md).

Issues / Features request tracker
-----------
Found an issue or have a feature request ?

Please create an issue [here](https://github.com/vagharsh/Jen2Spinnaker/issues).

Copyright and License
---------------------
Copyright and License under the [MIT license](LICENSE).
