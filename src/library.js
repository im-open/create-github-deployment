const core = require('@actions/core');
const github = require('@actions/github');
const { ALLOWED_STATUSES } = require('./deployments');
const INVALID_STATUS = 'InvalidStatus';

const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};

const notRequiredArgOptions = {
  required: false,
  trimWhitespace: true
};

class context {
  constructor(
    workflow_actor,
    token,
    environment,
    release_ref,
    deployment_status,
    deployment_description,
    entity,
    instance,
    server_url,
    workflow_run_id,
    owner,
    repo
  ) {
    this.workflow_actor = workflow_actor;
    this.token = token;
    this.environment = environment;
    this.release_ref = release_ref;
    this.deployment_status = deployment_status;
    this.deployment_description = deployment_description;
    this.entity = entity;
    this.instance = instance;
    this.server_url = server_url;
    this.workflow_run_id = workflow_run_id;
    this.owner = owner;
    this.repo = repo;
  }
}

function setup() {
  const workflow_actor = core.getInput('workflow-actor', requiredArgOptions);
  const token = core.getInput('token', requiredArgOptions);
  const environment = core.getInput('environment', requiredArgOptions);
  const release_ref = core.getInput('release-ref', requiredArgOptions);
  const deployment_status = core.getInput('deployment-status', requiredArgOptions);
  const deployment_description = core.getInput('deployment-description', notRequiredArgOptions);
  const entity = core.getInput('entity', requiredArgOptions);
  const instance = core.getInput('instance', requiredArgOptions);
  const server_url = github.context.serverUrl;
  const workflow_run_id = github.context.runId;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  if (!Object.values(ALLOWED_STATUSES).includes(deployment_status.toLowerCase())) {
    throw { name: INVALID_STATUS, message: `Invalid deployment status: ${deployment_status}` };
  }

  return new context(
    workflow_actor,
    token,
    environment,
    release_ref,
    deployment_status,
    deployment_description,
    entity,
    instance,
    server_url,
    workflow_run_id,
    owner,
    repo
  );
}

module.exports = {
  INVALID_STATUS,
  setup,
  context
};
