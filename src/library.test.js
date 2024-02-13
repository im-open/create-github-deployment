const { assert } = require('node:assert');
const { describe, test, expect, beforeEach } = require('@jest/globals');
const { setup, INVALID_STATUS } = require('./library.js');

const inputKey = key => `INPUT_${key.replace(/ /g, '-').toUpperCase()}`;

beforeEach(() => {
  process.env[inputKey('workflow-actor')] = 'test-actor';
  process.env[inputKey('token')] = 'test-token';
  process.env[inputKey('environment')] = 'test-environment';
  process.env[inputKey('release-ref')] = 'test-release-ref';
  process.env[inputKey('deployment-status')] = 'test-deployment-status';
  process.env[inputKey('deployment-description')] = 'test-deployment-description';
  process.env[inputKey('entity')] = 'test-entity';
  process.env[inputKey('instance')] = 'test-instance';
});

describe('deployment status', () => {
  test('invalid deployment status throws exception', () => {
    try {
      const invalidStatus = 'invalid-status';
      process.env['INPUT_DEPLOYMENT-STATUS'] = invalidStatus;
      const testConext = setup();
      expect(testConext).toBeUndefined();
    } catch (error) {
      expect(error.name).toBe(INVALID_STATUS);
    }
  });

  test('valid deployment status does not throw exception', () => {
    process.env['INPUT_DEPLOYMENT-STATUS'] = 'SUCCESS';
    try {
      const testConext = setup();
      expect(testConext.deployment_status).toBe('SUCCESS');
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });
});
