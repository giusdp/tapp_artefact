**Title of the submitted paper**: "An OpenWhisk Extension for Topology-aware Allocation Priority Policies"

**Abstract**: The artefact we present for evaluation is an extension of the Apache OpenWhisk serverless platform that supports tAPP-based scripts. The components in the artefact allows the user to deploy an
OpenWhisk cluster on the cloud and execute a set of examples to
showcase the usage of tAPP.

**URL**:

**SHA256**:

**Special Requirements**: To perform the evaluation of this artefact the user needs to have access to both Google Cloud Platform Compute Engine and Digital Ocean resource.

**Reusable Badge**: We deem our artefact to be reusable because it includes the source code of the modified OpenWhisk implementation to support tAPP. The user can look at the documentation included with the source code and modify it. Moreover, the artefact includes a set of Infrastructure-as-Code scripts (Ansible and Terraform) which the user
can customize to deploy Openwhisk on different configurations.

---

# Quick-start guide (Kick-the-tires phase)

The repository presents 2 folders needed for the deployment:

- _opentofu_: with the terraform scripts for the virtual machines deployment;
- _ansible_: with the setup and configuration of the VMs, the deployment of Kubernetes, the VPN creation and finally the tAPP-enabled OpenWhisk deployment.

The required dependencies to execute the commands are:

- [Google Cloud Platform account](https://cloud.google.com/) with a project and a service account with the necessary permissions to create Compute Engine instances and a credentials.json file;
- [Digital Ocean account](https://www.digitalocean.com/) with an access token;
- [Docker](https://www.docker.com/) to use the provided container equipped with an Ubuntu environment with OpenTofu, Ansible and wsk pre-installed. The system running Docker should be an x86-64 architecture. The software is not intended or tested on ARM (e.g., the latest Apple hardware) or other architectures.

A video showing a small demo is available at: https://vimeo.com/915098870

## Prepare for the VMs deployment:

Run the Docker container with the following command:

```bash
docker run -it --rm tapp_artefact bash
```

The container will start and you will be in the `/app` directory with
the repository files available.

Change directory to opentofu:

```bash
cd opentofu
```

Here the `provider.tf` script will deploy 3 machines on Google Cloud Platform and 2 machines on Digital Ocean. It can be customised to deploy fewer machines or user other providers as well.

First, create a file called `terraform.tfvars` with the same content as the file `tfvars.example`:

```bash
cp tfvars.example terraform.tfvars
```

The tfvars required are:

1.  project: the Google Cloud Platform project ID;
2.  gc_user: the GCP username owner of the project;
3.  allowd_ip: the allowed IP that will be able to connect to the cluster (it can be 0.0.0.0/0 to expose it completely);
4.  do_token: a Digital Ocean access token to deploy the other VMs. It can be obtained following [this guide](https://www.digitalocean.com/docs/apis-clis/api/create-personal-access-token/).

You can edit the file with nano or vim:

```bash
nano terraform.tfvars
```

For the Google Cloud deployments a "credentials.json" file is also needed to be present.

It can be obtained following [this guide](https://developers.google.com/workspace/guides/create-credentials). After creating a service account with Compute Engine privileges and requesting the credentials in json format.

You can copy the contents of the json file and in the opentofu folder run:

```bash
nano credentials.json
```

Then paste the content and save the file.

Finally, initialize the providers:

```bash
tofu init
```

## Ddeploy the VMs:

Run `tofu apply` (optionally with `-auto-approve` to skip the approval request, otherwise input "yes").

```bash
tofu apply -auto-approve
```

## Configure and Install OpenWhisk

After the VMs creation, 2 files are auto-generated in the _ansible_ folder:

- hosts.ini
- mycluster.yaml

Hosts.ini defines the existing VMs with their IPs and user names for ansible to connect to. The mycluster.yaml file is the configuration file for OpenWhisk.

To run the ansible playbook to automatically configure the machines and install OpenWhisk:

```bash
cd ../ansible
```

Once in the ansible folder:

```bash
ansible-playbook cluster.yaml
```

Once finished you can check on the status of the OpenWhisk installation by connecting via ssh to the kubernetes control-plane machine, either from another terminal or from the web GUI.

```bash
kubectl get pod -n openwhisk -o wide
```

This will show you the OpenWhisk related pods, their status and the machines where they are deployed to. When nginx, the controllers, kafka and the invokers are in the _Running_ status, you can start using OpenWhisk.

It might take more than 10 minutes for the installation to complete.

## Using OpenWhisk

The docker container provides a script to install and configure the OpenWhisk CLI. To use it first return to the /app directory:

```bash
cd ..
```

Then run the script:

```bash
./setupwsk.sh
```

Now you can start creating functions and run them. In the repository there is a _hello.js_ function that can be used:

```bash
wsk action create hello hello.js -i
```

The `-i` flag is required as there is no ssl certificate configured, hence we are using OpenWhisk in insecure mode.

#### tAPP Configurations

Before invoking any function, tAPP-enabled OpenWhisk comes with a pre-baked example tAPP script. It must first be configured to an appropriate script. To do so. you can edit the `configLB.yml` from the OpenWhisk controllers persistent volume claims from the Kubernetes control-plane VM.

```bash
sudo nano /var/nfs/kubedata/openwhisk-owdev-controller-<hash>/configLB.yml
```

For example you could use:

```yaml
- a_policy_tag:
    - controller: "controller"
      workers:
        - set:
      topology_tolerance: "all"
  followup: default
```

Once the configLB.yml file is updated, from the local machine it will be possible to request a refresh of the current configuration by invoking a function with the special `-p controller_config_refresh true` parameter:

```bash
wsk action invoke hello -p controller_config_refresh true -i
```

(it might initially return error but the configuration will be updated).

Now it is possible to invoke functions using the newly updated configuration:

```
wsk action invoke hello -r -i
```

To create tagged functions, there os the `-a` flag to add annotations at functions creation. You can add the special `tag` annotation to tag a function:

```bash
wsk action create tagged_function hello.js -a tag a_policy_tag -i
```

To also make use of the modified nginx to choose specific controllers, the policy tag must be passed at invocation time as a parameter:

```bash
wsk action invoke tagged_function -p tag a_policy_tag -r -i
```

#### Clean up

To delete the cluster and remove all the machines:

- `cd opentofu`
- `tofu destroy` (with optionally `-auto-approve`)
