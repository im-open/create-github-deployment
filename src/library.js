import { getInput } from '@actions/core';
import { context as _context } from '@actions/github';
import { ALLOWED_STATUSES } from './deployments';
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
  const workflow_actor = getInput('workflow-actor', requiredArgOptions);
  const token = getInput('token', requiredArgOptions);
  const environment = getInput('environment', requiredArgOptions);
  const release_ref = getInput('release-ref', requiredArgOptions);
  const deployment_status = getInput('deployment-status', requiredArgOptions);
  const deployment_description = getInput('deployment-description', notRequiredArgOptions);
  const entity = getInput('entity', requiredArgOptions);
  const instance = getInput('instance', requiredArgOptions);
  const server_url = _context.serverUrl;
  const workflow_run_id = _context.runId;
  const owner = _context.repo.owner;
  const repo = _context.repo.repo;

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

export { INVALID_STATUS, setup, context };
