A deployment of our modified Openwhisk with the tAPP-enabled load balancer can be reproduced via our deployment scripts found in https://github.com/giusdp/ow-gcp/tree/tapp in the branch _tapp_.

The repository presents 2 folders needed for the deployment: _opentofu_ with the terraform scripts for the virtual machines deployment, and _ansible_ for the setup and configuration of the VMs, the deployment of Kubernetes, the VPN creation and finally the tAPP-enabled OpenWhisk deployment. OpenTofu is a drop-in open-source replacement of Terraform, so either one can be used.

The required dependencies to execute the commands are:

- OpenTofu/Terraform
- Ansible
- Google Cloud Platform account
- Digital Ocean account
- Wsk (the OpenWhisk CLI tool)

The provided docker image comes equipped with an Ubuntu environment with OpenTofu, Ansible and wsk pre-installed and the repository already cloned.

A video showing a small demo is available at: https://vimeo.com/915098870

#### To prepare for the VMs deployment:

In the opentofu directory, the provider.tf script will deploy 3 machines on Google Cloud Platform and 2 machines on Digital Ocean. It can be customised to deploy fewer machines or user other providers as well.

1. Change directory to opentofu: `cd opentofu`
2. Initialize the providers: `tofu init`
3. Once initialized, create a file called `terraform.tfvars` with the same content as the file `tfvars.example`. The tfvars required are:
   1. project: the Google Cloud Platform project ID;
   2. gc_user: the GCP username owner of the project;
   3. allowd_ip: the allowed IP that will be able to connect to the cluster (it can be 0.0.0.0/0 to expose it completely);
   4. do_token: a Digital Ocean access token to deploy the other VMs.
4. For the Google Cloud deployments a "credentials.json" file is also needed to be present. It can be obtained from Google Cloud Platform website or via the gcloud command line tool by creating a service account with the priviliges to create Compute Engine instances and requesting the credentials in json format.
5. Finally a ssh key pair is required to be able to access the VMs via ansible. During VM deployment, the provider.tf script will inject a "ow-gcp-key.pub" key in each machine from the parent folder. You can create the key with that name with `cd .. && ssh-keygen` and giving as input for the key name `./ow-gcp-key`.

#### To deploy the VMs:

Now you can cd into opentofu again and run `tofu apply` (optionally with `-auto-approve` to skip the approval request).

#### Install OpenWhisk

After the VMs creation, 2 files are auto-generated in the _ansible_ folder:

- hosts.ini
- mycluster.yaml

Hosts.ini defines the existing VMs with their IPs and user names for ansible to connect to. The mycluster.yaml file is the configuration file for OpenWhisk.

Once the above steps are completed. You can check on the status of the OpenWhisk installation by connecting via ssh to the kubernetes control-plane machine and run:

```bash
kubectl get pod -n openwhisk -o wide
```

This will show you the OpenWhisk related pods, their status and the machines where they are deployed to. When nginx, the controllers, kafka and the invokers are in the _Running_ status, you can start using OpenWhisk.

On your local machine, download the _wsk_ CLI: https://github.com/apache/openwhisk-cli/releases

Then configure it with the default guest token with the following command:

```bash
wsk property set --auth 23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP
```

Finally set the apihost with the public IP of the control-plane GCP VM:

```bash
wsk property set --apihost <IP>:31001
```

Now you can start creating functions and run them. In the repository there is a _hello.js_ function that can be used:

```bash
wsk action create hello hello.js -i
```

The `-i` flag is required as there is no ssl certificate configured, hence we are using OpenWhisk in insecure mode.

#### tAPP Configurations

Before invoking any function, tAPP-enabled OpenWhisk comes with a pre-baked example tAPP script. It must first be configured to an appropriate script. To do so. you can edit the `configLB.yml` from the OpenWhisk controllers persistent volume claims from the Kubernetes control-plane VM.

```bash
sudo nano /var/nfs/kubedata/owdev-controller-<hash>/configLB.yml
```

Once the configLB.yml file is updated, from the local machine it will be possible to request a refresh of the current configuration by invoking a function with the special `-p controller_config_refresh true` parameter:

```bash
wsk action invoke hello -p controller_config_refresh true -i
```

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
