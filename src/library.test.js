const { assert } = require('node:assert');
const { describe, test, expect, beforeEach } = require('@jest/globals');

const { setup, INVALID_STATUS } = require('./library.js');

function prepTests() {
  process.env['INPUT_WORKFLOW-ACTOR'] = 'test-actor';
  process.env['INPUT_TOKEN'] = 'test-token';
  process.env['INPUT_ENVIRONMENT'] = 'test-environment';
  process.env['INPUT_RELEASE-REF'] = 'test-release-ref';
  process.env['INPUT_DEPLOYMENT-STATUS'] = 'test-deployment-status';
  process.env['INPUT_DEPLOYMENT-DESCRIPTION'] = 'test-deployment-description';
  process.env['INPUT_ENTITY'] = 'test-entity';
  process.env['INPUT_INSTANCE'] = 'test-instance';
}

beforeEach(() => prepTests());

describe('deployment status', () => {
  test('invalid deployment status throws exception', () => {
    try {
      const invalidStatus = 'invalid-status';
      process.env['INPUT_DEPLOYMENT-STATUS'] = invalidStatus;
      const testConext = setup();
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
      expect(error).toBe(undefined);
    }
  });
});
