import { setOutput, setFailed } from '@actions/core';
import { setup } from './library.js';
import { createDeployment } from './deployments.js';

async function runCreateDeployment(context) {
  return await createDeployment(context);
}

async function run() {
  try {
    const setupContext = setup();
    const runPromise = new Promise((resolve, reject) => resolve(runCreateDeployment(setupContext)));
    await runPromise.then(deploymentId => setOutput('github-deployment-id', deploymentId));
  } catch (error) {
    //Anything that shows up here should be a re-thrown error where the detailed error was already logged.
    //We can set a generic failure message because the more detailed one should already have been logged.
    setFailed(`An error occurred creating a GitHub deployment: ${error.message}`);
    return;
  }
}

run();
