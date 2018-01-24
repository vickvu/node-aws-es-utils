# AWS Elasticsearch Utils

[![Greenkeeper badge](https://badges.greenkeeper.io/vickvu/node-aws-es-utils.svg)](https://greenkeeper.io/)

[![NPM](https://nodei.co/npm/aws-es-utils.png)](https://npmjs.org/package/aws-es-utils)

[![Build Status](https://travis-ci.org/vickvu/node-aws-es-utils.svg?branch=master)](https://travis-ci.org/vickvu/node-aws-es-utils)
[![Coverage Status](https://coveralls.io/repos/github/vickvu/node-aws-es-utils/badge.svg?branch=master)](https://coveralls.io/github/vickvu/node-aws-es-utils?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/vickvu/node-aws-es-utils/badge.svg)](https://snyk.io/test/github/vickvu/node-aws-es-utils)

## Sign request
If you limit your [Amazon Elasticsearch Service](https://aws.amazon.com/elasticsearch-service/) with an IAM role, you will need to [sign every http request](http://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-managedomains.html#es-managedomains-signing-service-requests) made to the service. The function `createESConnectorClass` creates a new class that can be used as a drop-in replacement for [Elasticsearch default class](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/extending_core_components.html#_connection). For example:
```javascript
var elasticsearch = require('elasticsearch');
var esHttpConnector = require('elasticsearch/src/lib/connectors/http');
var AWS = require('aws-sdk');
var awsEs = require('aws-es-utils');
var let client = new elasticsearch.Client({
  host: 'https://xxxx.ap-southeast-2.es.amazonaws.com',
  connectionClass: awsEs.createESConnectorClass({
    AWS: AWS,
    superClass: esHttpConnector
  }),
  awsRequestSigning: true
});
```
Extra [config](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html) to Elasticsearch client constructor
 - `awsRequestSigning` (boolean): enable AWS request signing
 - `awsRegion` (string | optional): [AWS region](http://docs.aws.amazon.com/general/latest/gr/rande.html). If this property is missing, the class will try to parse the region from the host name.
 - `awsCredential` (object | optional): optional [AWS credentials](http://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html). If this property is missing, the class will try to use [AWS.CredentialProviderChain](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CredentialProviderChain.html) to retrieve the default credential. This property could be either an [AWS.Credentials](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Credentials.html) object or a normal object with the following properties:
   - `accessKeyId` (string): the [AWS access key ID](http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)
   - `secretAccessKey` (string): the [AWS secret access key](http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)
   - `sessionToken` (string): the optional AWS session token (the string you received from AWS STS when you obtained temporary security credentials))

 # License
 This project is licensed under the terms of the [Apache license](./LICENSE).
