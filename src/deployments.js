const { Octokit } = require('@octokit/rest');
const { graphql } = require('@octokit/graphql');
const WORKFLOW_DEPLOY = 'workflowdeploy';
const ALLOWED_STATUSES = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAILURE: 'failure',
  INACTIVE: 'inactive',
  IN_PROGRESS: 'in_progress',
  QUEUED: 'queued',
  PENDING: 'pending'
};

const createOctokitClient = token => new Octokit({ auth: token });
const createOctokitGraphQLClient = token =>
  graphql.defaults({ headers: { authorization: `token ${token}` } });

async function inactivatePriorDeployments(context, currentDeploymentNodeId) {
  const octokit = createOctokitClient(context.token);
  const octokitGraphQl = createOctokitGraphQLClient(context.token);

  const params = {
    owner: context.owner,
    repo: context.repo,
    task: WORKFLOW_DEPLOY,
    environment: context.environment,
    per_page: 100
  };

  const deploymentsList = (
    await getPriorDeployments(octokit, context.entity, context.instance, params)
  ).filter(d => d.node_id != currentDeploymentNodeId);

  const statuses = await getPriorDeploymentStatuses(
    octokitGraphQl,
    deploymentsList.map(d => d.node_id)
  );

  for (let i = 0; i < statuses.length; i++) {
    let deploymentQl = statuses[i];
    let deployment = deploymentsList.filter(d => d.node_id == deploymentQl.id)[0];

    for (let j = 0; j < deploymentQl.statuses.nodes.length; j++) {
      const status = deploymentQl.statuses.nodes[j];

      if (deployment.payload.instance == context.instance && status.state == 'SUCCESS') {
        await createDeploymentStatus(
          octokit,
          context.owner,
          context.repo,
          deployment.id,
          context.environment,
          'inactive',
          'Inactivated by workflow'
        );
      }
    }
  }
}

async function getPriorDeployments(octokit, entity, instance, params) {
  return (await octokit.paginate(octokit.rest.repos.listDeployments, params)).filter(
    d => d.payload.entity == entity && d.payload.instance == instance
  );
}

async function getPriorDeploymentStatuses(octokitGraphQl, deploymentNodeIds) {
  const statuses = [];
  const statusesQuery = `
          query($deploymentNodeIds: [ID!]!) {
            deployments: nodes(ids: $deploymentNodeIds) {
              ... on Deployment {
                id
                databaseId
                statuses(first:1) {
                  nodes {
                    description
                    state
                    createdAt
                  }
                }
              }
            }
          }`;

  const page = 100;
  const pages = Math.ceil(deploymentNodeIds.length / page);
  const statusRequests = [];

  for (var i = 0; i < pages; i++) {
    const sliced = deploymentNodeIds.slice(i * page, (i + 1) * page);
    statusRequests.push(await octokitGraphQl(statusesQuery, { deploymentNodeIds: sliced }));
  }

  await Promise.all(statusRequests).then(response => {
    for (var i = 0; i < response.length; i++) {
      statuses.push(...response[i].deployments);
    }
  });
  return statuses;
}

async function createDeployment(context) {
  const octokit = createOctokitClient(context.token);

  // create deployment record
  const deployment = (
    await octokit.rest.repos.createDeployment({
      owner: context.owner,
      repo: context.repo,
      ref: context.release_ref,
      environment: context.environment,
      task: WORKFLOW_DEPLOY,
      auto_merge: false,
      required_contexts: [],
      transient_environment: true,

      payload: {
        entity: context.entity,
        instance: context.instance,
        workflow_run_url: `${context.server_url}/${context.owner}/${context.repo}/actions/runs/${context.workflow_run_id}`,
        workflow_actor: context.workflow_actor
      }
    })
  ).data;

  const inactivate = new Promise((resolve, reject) =>
    resolve(inactivatePriorDeployments(context, deployment.node_id))
  );

  inactivate.then(async () => {
    await createDeploymentStatus(
      octokit,
      context.owner,
      context.repo,
      deployment.id,
      context.environment,
      context.deployment_status,
      context.deployment_description
    );
  });

  return deployment.id;
}

async function createDeploymentStatus(
  octokit,
  owner,
  repo,
  deployment_id,
  environment,
  state,
  description
) {
  const statusParams = {
    owner: owner,
    repo: repo,
    deployment_id: deployment_id,
    environment: environment,
    state: state,
    description: description,
    auto_inactive: false // we will manually inactivate prior deployments
  };
  const status = await octokit.rest.repos.createDeploymentStatus(statusParams);
}

module.exports = {
  ALLOWED_STATUSES,
  WORKFLOW_DEPLOY,
  createDeployment,
  createOctokitClient,
  createOctokitGraphQLClient,
  getPriorDeployments,
  getPriorDeploymentStatuses
};
