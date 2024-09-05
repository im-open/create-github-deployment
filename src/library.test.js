const { describe, test, expect, beforeEach } = require('@jest/globals');
const { setup, INVALID_STATUS } = require('./library.js');
const { ALLOWED_STATUSES } = require('./deployments.js');

const inputKey = key => `INPUT_${key.replace(/ /g, '-').toUpperCase()}`;

beforeEach(() => {
  // This is needed for the context.repo call in  library.setup()
  process.env['GITHUB_REPOSITORY'] = 'im-open/create-github-deployment';

  // These are needed for the action inputs
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
      process.env[inputKey('deployment-status')] = invalidStatus;
      const testContext = setup();
      expect(testContext).toBeUndefined();
    } catch (error) {
      expect(error.name).toBe(INVALID_STATUS);
    }
  });

  test.each(Object.values(ALLOWED_STATUSES))(
    `valid deployment status of %s does not throw exception`,
    status => {
      process.env[inputKey('deployment-status')] = status;
      try {
        const testContext = setup();
        expect(testContext.deployment_status).toBe(status);
      } catch (error) {
        expect(error).toBeUndefined();
      }
    }
  );
});
