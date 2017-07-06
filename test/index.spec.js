require('should');
const sinon = require('sinon');
const nock = require('nock');
const elasticsearch = require('elasticsearch');
const superClass = require('elasticsearch/src/lib/connectors/http');
const AWS = require('aws-sdk');
const awsEs = require(SRC);

let sandbox;

describe('createESConnectorClass', function() {
  const ES_HOST = 'https://es-host:9200';

  beforeEach(function() {
    nock.disableNetConnect();
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    nock.cleanAll();
    nock.enableNetConnect();
    sandbox.restore();
  });

  context('when awsRequestSigning is false', function() {
    beforeEach(function() {
      nock(ES_HOST, {
        badheaders: ['x-amz-date', 'x-amz-security-token']
      })
        .get('/_nodes/stats')
        .reply(200, {
          healthy: true
        });
    });

    it('should not sign the request', function() {
      let client = new elasticsearch.Client({
        host: ES_HOST,
        connectionClass: awsEs.createESConnectorClass({AWS, superClass})
      });
      return client.nodes.stats().then(function(resp) {
        resp.should.eql({healthy: true});
      });
    });
  });

  context('when awsRequestSigning is true', function() {
    const AWS_ACCESS_KEY_ID = 'access key';
    const AWS_SECRET_ACCESS_KEY = 'secret access';
    const AWS_SESSION_TOKEN = 'session token';

    beforeEach(function() {
      sandbox.useFakeTimers(new Date('2017-01-01'));
      nock(ES_HOST, {
        reqheaders: {
          Host: 'es-host',
          'x-amz-date': '20170101T000000Z',
          'x-amz-security-token': AWS_SESSION_TOKEN
        }
      })
        .get('/_nodes/stats')
        .reply(200, {
          healthy: true
        });
    });

    context('with explicit credential', function() {

      it('should sign the request', function() {
        let client = new elasticsearch.Client({
          host: ES_HOST,
          connectionClass: awsEs.createESConnectorClass({AWS, superClass}),
          awsRequestSigning: true,
          awsRegion: 'ap-southeast-2',
          awsCredential: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            sessionToken: AWS_SESSION_TOKEN
          }
        });
        return client.nodes.stats().then(function(resp) {
          resp.should.eql({healthy: true});
        });
      });
    });

    context('with implicit credential', function() {
      beforeEach(function(){
        sandbox.stub(AWS.CredentialProviderChain.prototype, 'resolve').yields(null,awsCredential );
      });

      it('should sign the request', function() {
        let client = new elasticsearch.Client({
          host: ES_HOST,
          connectionClass: awsEs.createESConnectorClass({AWS, superClass}),
          awsRequestSigning: true,
          awsRegion: 'ap-southeast-2'
        });
        return client.nodes.stats().then(function(resp) {
          resp.should.eql({healthy: true});
        });
      });
    });

  });
});
