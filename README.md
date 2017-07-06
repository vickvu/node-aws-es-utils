# AWS Elasticsearch Utils

## Sign request
If you limit your AWS Elasticsearch service with an IAM role, you will need to sign every http request made to the service. The function `createESConnectorClass` creates a new class that can be used as a drop-in replacement for Elasticsearch default class. For example:
```javascript
var elasticsearch = require('elasticsearch');
var esHttpConnector = require('elasticsearch/src/lib/connectors/http');
var AWS = require('aws-sdk');
var awsEs = require('aws-es-utils');
var let client = new elasticsearch.Client({
  host: 'https://es-host:9200',
  connectionClass: awsEs.createESConnectorClass({
    AWS: AWS,
    superClass: esHttpConnector
  }),
  awsRequestSigning: true,
  awsRegion: 'ap-southeast-2'
});
```
Extra config to Elasticsearch client constructor
 - `awsRequestSigning` (boolean): enable AWS request signing
 - `awsRegion` (string): AWS region
 - `awsCredential` (object | optional): optional credential object. If this property is missing, the class will try to use AWS.CredentialProviderChain to retrieve the default credential. This property could be either an AWS.Credentials object or a normal object with the following property
  - `accessKeyId` (string | optional): the AWS access key ID
  - `secretAccessKey` (string | optional): the AWS secret access key
  - `sessionToken` (string | optional): the optional AWS session token

 # License
 This project is licensed under the terms of the [MIT license](./LICENSE).
