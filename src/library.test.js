const test = require('node:test');
const assert = require('node:assert');

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

test('invalid deployment status throws exception', () => {
  prepTests();

  try {
    const invalidStatus = 'invalid-status';
    process.env['INPUT_DEPLOYMENT-STATUS'] = invalidStatus;
    const testConext = setup();
  } catch (error) {
    assert.equal(error.name, INVALID_STATUS);
  }
});

test('valid deployment status does not throw exception', () => {
  prepTests();
  process.env['INPUT_DEPLOYMENT-STATUS'] = 'SUCCESS';
  try {
    const testConext = setup();
    assert.equal(testConext.deployment_status, 'SUCCESS');
  } catch (error) {
    assert.fail('Exception was thrown');
  }
});
