const { describe, test, expect, beforeEach, beforeAll, afterAll } = require('@jest/globals');
const {
  ALLOWED_STATUSES,
  WORKFLOW_DEPLOY,
  createOctokitClient,
  createOctokitGraphQLClient,
  getPriorDeployments,
  getPriorDeploymentStatuses,
  createDeployment
} = require('./deployments.js');
const { context } = require('./library.js');

const token = process.env['GITHUB_TOKEN'];
let octokit;
let octokitGraphQl;
const owner = 'im-open';
const repo = 'create-github-deployment';
const create_environment = 'INTEGRATION';
const pull_environment = 'DEV';
const entity = 'create-github-deployment';
const instance = 'action';
const priorDeployments = [];
const priorDeploymentStatuses = [];
let testDeploymentId = null;
const workflow_actor = 'test-actor';

// Create the octokit clients
beforeAll(() => {
  octokit = createOctokitClient(token);
  octokitGraphQl = createOctokitGraphQLClient(token);
});

//clean up test deployment
afterAll(async () => {
  if (testDeploymentId !== null) {
    setTimeout(async () => {
      await octokit.rest.repos.deleteDeployment({
        owner: owner,
        repo: repo,
        deployment_id: testDeploymentId
      });
      octokit = null;
      octokitGraphQl = null;
    }, 5000);
  }
});

describe('deployments', () => {
  let firstDeploymentId;

  test('get the deployments', async () => {
    const deployments = await getPriorDeployments(octokit, entity, instance, {
      owner: owner,
      repo: repo,
      task: WORKFLOW_DEPLOY,
      environment: pull_environment,
      per_page: 100
    });
    expect(deployments).toBeDefined();
    expect(deployments.length).toBeGreaterThan(0);
    expect(deployments[0].payload).toBeDefined();
    firstDeploymentId = deployments[0].node_id;

    priorDeployments.push(...deployments);
  });

  test('get the deployment statuses', async () => {
    const statuses = await getPriorDeploymentStatuses(octokitGraphQl, [firstDeploymentId]);
    expect(statuses).toBeDefined();
    expect(statuses.length).toBeGreaterThan(0);

    expect(statuses[0].statuses).toBeDefined();
    expect(statuses[0].statuses.nodes).toBeDefined();
    expect(statuses[0].statuses.nodes.length).toBeGreaterThan(0);

    priorDeploymentStatuses.push(...statuses);
  });

  test('create deployment', async () => {
    testDeploymentId = await createDeployment(
      new context(
        workflow_actor,
        token,
        create_environment,
        'v1',
        ALLOWED_STATUSES.SUCCESS,
        'Testing deployment creation',
        entity,
        instance,
        'https://github.com',
        'https://github.com',
        owner,
        repo
      )
    );

    expect(Number.isNaN(testDeploymentId)).toBe(false);
  });
});
