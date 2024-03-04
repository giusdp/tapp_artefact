This is the readme regarding the tests performed on the modified OpenWhisk platform, and how to replicate them. This folder is not part of the OpenWhisk deployment on kubernetes.

To deploy the functions:
- the various test cases are under `test-code`
- each of them contains an `openwhisk` folder
- for nodejs-based tests, run `npm install`
- after this, run `sls deploy`


To perform the tests:
- the tests require JMeter and are in the form of JMeter templates
- the files in both subfolders under `jmeter-templates` are named as follow:
    - `all_ow_*.jmx` for the `hellojs`, `matrixMult` and `sleep` test cases
    - `all_wonderless_ow_*.jmx` for the `pycatj` and `slackpost` test cases
    - `coldstart_critical_ow_*.jmx` for the `coldstart` test case
    - `datalocality_critical_ow_*.jmx` for the `datalocality` test case
    - `terrain_ow_*.jmx` for the `terrain` test case
    - `mongoDB_ow_*.jmx` for the `mongoDB` test case
- to perform the tests using JMeter, run `jmeter -n -t <template_name> -Jroot=<root folder> -Jip=<cluster ip> -Jcounter="<number of repetition>"`
- for tests under the `modified` folder, the `Jpolicy` parameter is required
- for the `terrain` test, the `Jhost` parameter is required
- for the `slackpost` test, the `Jslackpath` parameter is required
- for the `mongoDB` and `data-locality` test, the `Jdbip`, `Jusername`, `Jpassword`, `Jdbname` parameters are required
- for `terrain`, `mongoDB` and `data-locality` tests using the modified version, the `Jtag` and `Jtolerance` parameters are required
- the `Jpolicy` and `Jtolerance` parameters only affect the output folder, but have no effect on the OpenWhisk configuration; as such, when testing for different policies or tolerance levels, these parameters also have to be changed on the deployment side
___

The `wonderless_discarded.csv` file contains a list of the analysed repositories in the Wonderless dataset; each of them has either been discarded for a specific reason (listed in the file) or used as part of the test suite.
