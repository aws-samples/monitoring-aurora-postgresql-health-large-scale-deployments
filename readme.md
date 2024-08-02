# Getting Started

This repository creates Aurora Postgres Health Monitor application. This application provides automated and streamlined way for the monitoring tasks of large-scale deployments by leveraging AWS managed services for scalability and efficiency.

## Installation

After cloning the repo, run the following

```
cd web
npm install 
cd ..
cd server
npm install
```

## Configuration

Review the `server/cdk.context.json` file for the configuration changes. Here are the default values

```
{
  "scheduleDurationInHours": 1,
  "metricsTracked": [
    {
      "name": "VolumeReadIOPS",
      "threshold": 90,
      "thresholdOperator": ">="
    },
    {
      "name": "BufferCacheHitRatio",
      "threshold": 90,
      "thresholdOperator": "<="
    },
    {
      "name": "CPUUtilization",
      "threshold": 95,
      "thresholdOperator": ">="
    }
  ]
}
```

### Configuration Explained

* `scheduleDurationInHours` - At this specified duration, the cloudwatch metrics logs for the defined metrics are traversed. For example, if this value is set to `6` then, for each 6 hours, the schedule will execute a function, which will capture hourly metrics for those 6 hours.
* `metricsTracked` - This tells the application what metrics you would want to capture. This is an array of items as defined below. Although these values are changeable to your needs, it is recommended to start with and stick to the values provided by this application
  * `name` - This is the of the metrics to be captured
  * `threshold` - This is the threshold at which the cloudwatch metrics will be considered as unhealthy. The application captures max of the metrics matching to this threshold along with `thresholdOperator` explained below. Please note that this value should change according to metrics. For example, for `FreeableMemory` you may want to use a number that is expressed in Memory Bytes, whereas for `CPUUtilization` you may want to use a number that is expressed in percentage.
  * `thresholdOperator` - This is the threshold operator, and supported operators are `=`, `>`, `<`, `<=`,`>=`

  For example a record like
  `{  "name": "BufferCacheHitRatio",
      "threshold": 90,
      "thresholdOperator": "<="}` would mean that, if the Max(BufferCacheHitRatio) metrics within cloudwatch is `less than or equal` to `90`, then it will be reported as unhealthy instance in this application.

## Prerequisites

This application works with cloudwatch metrics captured by existing Aurora databases. In case you want to try this solution with a test database, then you can follow below steps

* Provision an Amazon Aurora PostgreSQL databases which works as a test database for this solution. This will be your active production database which you would like to monitor. An Aurora PostgreSQL instance of size db.t4g.medium was used to generate the load for testing as per the steps below.
* Gather read time database host metrics with Enhanced Monitoring for the Aurora database. Please read for further information on differences between CloudWatch and Enhanced Monitoring.
* The test requires an AWS EC2 linux instance or a Cloud9 instance provisioned in the same VPC.
* Install postgresql client on the server.
On an Amazon Linux 2023 EC2 instance (PostgreSQL v15):

```
sudo yum -y install postgresql15
```

On an Amazon Linux 2 EC2 server (PostgreSQL v14):

```
sudo tee /etc/yum.repos.d/pgdg.repo<<EOF 
[pgdg14] 
name=PostgreSQL 14 for RHEL/CentOS 7 - x86_64 baseurl=https://download.postgresql.org/pub/repos/yum/14/redhat/rhel-7-x86_64 
enabled=1 
gpgcheck=0 
EOF
$ sudo yum update
$ sudo yum install postgresql14 
```

* Connect to the Aurora instance and create an example database

```
psql -h <Aurora endpoint> -U <username>
psql> create database example;
psql> exit

```

* Install pgbench and initialize the example database 

```
sudo yum install postgresql15-contrib
pgbench -i example -h <aurora writer endpoint> -U postgres 
```
* Run the pgbench tool to generate CPU and Memory load for the tests

```
pgbench -c 20 -j 2 -t 20000 example -h <aurora writer endpoint> -U <username>
```

pgbench is a native tool provided to run benchmarking tests on postgres databases. Here in the above command, we provide 20 clients (`-c` argument), 2 threads for each client (`-j` argument) and each job running 20000 transactions (`-t` argument). The above command will create tables and do inserts/updates/deletes in the database “example” to create the load on the database.

## Deployment

Deploy using following command

```
cd server
npm run deploy -- -c sourceIp=PUBLIC_IP_GOES_HERE
```

Replace `PUBLIC_IP_GOES_HERE` value with the public IP of your machine. This makes sure that the API gateway is only accessible from your machine and not publically accessible.


## Cleanup

You can clean up using this command

```
cd server
cdk destroy -c sourceIp=PUBLIC_IP_GOES_HERE
```