const zlib = require('zlib');
const EventEmitter = require('events');

exports.createESConnectorClass = function(opts) {
  const superClass = opts.superClass;
  const AWS = opts.AWS;
  return class newClass extends superClass {
    constructor(host, config) {
      super(host, config);
      if (config.awsRequestSigning) {
        this.awsRequestSigning = true;
        if (config.awsRegion) {
          this.awsRegion = config.awsRegion;
        } else {
          let match = host.host.match(/\.([^.]+)\.es\.amazonaws\.com$/);
          if (match) {
            this.awsRegion = match[1];
          }
        }
        if (config.awsCredential) {
          if (config.awsCredential.constructor === AWS.Credentials) {
            this.awsCredential = config.awsCredential;
          } else {
            this.awsCredential = new AWS.Credentials(config.awsCredential);
          }
        } else {
          this.awsCredentialEvent = new EventEmitter();
          new AWS.CredentialProviderChain().resolve((err, credential) => {
            this.awsCredential = credential;
            this.awsCredentialEvent.emit('finish', err);
          });
        }
      }
      if (config.headers && typeof config.headers === 'object') {
        this.esHeaders = config.headers;
      }
    }

    makeESRequest(params, callback) {
      const log = this.log;
      let responseHeaders = {};
      let responseStatus = 0;
      let responseContent = null;
      const reqParams = this.makeReqParams(params);
      const awsReq = new AWS.HttpRequest(this.host.toString());
      awsReq.method = reqParams.method;
      awsReq.path = reqParams.path;
      awsReq.region = this.awsRegion;
      awsReq.body = params.body;
      awsReq.headers['presigned-expires'] = false;
      awsReq.headers['Host'] = this.host.host;
      awsReq.headers['Content-Type'] = 'application/json';
      if (this.esHeaders) {
        for (const header in this.esHeaders) {
          awsReq.headers[header] = this.esHeaders[header];
        }
      }
      const awsSigner = new AWS.Signers.V4(awsReq, 'es');
      awsSigner.addAuthorization(this.awsCredential, new Date());
      const awsHttpClient = new AWS.NodeHttpClient();
      let cleanupAlreadyCalled = false;
      let requestStream = null;
      let responseStream = null;
      const cleanUp = function (err) {
        if (cleanupAlreadyCalled) {
          return;
        }
        cleanupAlreadyCalled = true;
        requestStream && requestStream.removeAllListeners();
        responseStream && responseStream.removeAllListeners();
        if ((err instanceof Error) === false) {
          err = void 0;
        }
        log.trace(params.method, reqParams, params.body, responseContent, responseStatus);
        if (err) {
          return callback(err);
        }
        callback(null, responseContent, responseStatus, responseHeaders);
      };
      const okCallback = function(resp) {
        responseStream = resp;
        responseStatus = responseStream.statusCode;
        responseHeaders = responseStream.headers;
        responseContent = '';

        const encoding = (responseHeaders['content-encoding'] || '').toLowerCase();
        if (encoding === 'gzip' || encoding === 'deflate') {
          responseStream = responseStream.pipe(zlib.createUnzip());
        }
        responseStream.setEncoding('utf8');
        responseStream.on('data', function (d) {
          responseContent += d;
        });
        responseStream.on('error', cleanUp);
        responseStream.on('end', cleanUp);
      };
      requestStream = awsHttpClient.handleRequest(awsReq, {agent: reqParams.agent}, okCallback, cleanUp);
      requestStream.on('error', cleanUp);
      requestStream.setNoDelay(true);
      requestStream.setSocketKeepAlive(true);
      return requestStream;
    }

    request(params, callback) {
      if (!this.awsRequestSigning) {
        return super.request(params, callback);
      }
      let aborted = false;
      let requestStream = null;
      if (!this.awsCredential) {
        this.awsCredentialEvent.once('finish', (err) => {
          if (!aborted) {
            if (err) {
              return callback(err);
            }
            this.awsCredential.get(() => {
              requestStream = this.makeESRequest(params, callback);
            });
          }
        });
      } else {
        this.awsCredential.get(() => {
          if (!aborted) {
            requestStream = this.makeESRequest(params, callback);
          }
        });
      }
      return function () {
        if (!aborted) {
          aborted = true;
          if (requestStream) {
            requestStream.abort();
          }
        }
      };
    }
  };
};
