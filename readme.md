# Getting Started

## Installation

After cloning the repo, run `npm install` in the `frontend` and `server` directories. 

## Run Security Scan

You can run this command to run the security scan `./runsecurityscan.sh`. This tool removes node_modules directories, runs the CodeGuru script and restores the npm modules. The results will be available in the AWS account.

## Deployment

Deploy using following command `cdk deploy -c sourceIp=173.71.123.159` . The IP here is the public IP of your machine. This makes sure that the API gateway is only accessible from your machine and not public
