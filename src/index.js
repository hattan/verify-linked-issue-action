const core = require("@actions/core");
const { Toolkit } = require("actions-toolkit");

Toolkit.run(
  async (tools) => {
    try {
      if (!tools.context.payload.pull_request) {
        tools.log.warn("Not a pull request skipping verification!");
        return;
      }

      await verifyLinkedIssue(tools);
    } catch (err) {
      tools.log.error(`Error verifying linked issue.`);
      tools.log.error(err);

      if (err.errors) tools.log.error(err.errors);
      const errorMessage = "Error verifying linked issue.";
      core.setFailed(errorMessage + "\n\n" + err.message);
      tools.exit.failure();
    }
  },
  {
    secrets: ["GITHUB_TOKEN"],
    token: process.env.ACCESS_TOKEN || process.env.GITHUB_TOKEN,
  }
);

async function verifyLinkedIssue(tools) {
  const context = tools.context,
    github = tools.github,
    log = tools.log;

  const linkedIssue = await checkBodyForValidIssue(context, github, log);

  if (linkedIssue) {
    log.success("Success! Valid linked issue found!");
  } else {
    await createMissingIssueComment(context, github, log, tools);
    core.setFailed("No valid linked issue found!");
    tools.exit.failure();
  }
}

async function checkBodyForValidIssue(context, github, log) {
  let body = context.payload.pull_request.body;
  log.debug(`Checking PR Body: "${body}"…`);
  const matches = extractIssues(body);

  for (i in matches) {
    const match = matches[i];

    const issueNumber = match.issueNumber;
    const owner = match.owner || context.repo.owner;
    const repo = match.repo || context.repo.repo;

    log.debug(`Verfiying #${issueNumber} is a valid issue…`);
    try {
      let issue = await getIssue(github, owner, repo, issueNumber);
      if (issue) {
        log.debug(`Found issue #${issueNumber} from PR Body.`);

        return checkIssue(issue.data, log);
      }
    } catch (error) {
      log.error(error);
      log.debug(`#${issueNumber} is not a valid issue.`);
    }
  }

  return false;
}

async function createMissingIssueComment(context, github, log, tools) {
  const defaultMessage =
    "No valid linked issue found. Check the Lint PR action for details.";
  let messageBody = core.getInput("message");
  if (!messageBody) {
    let filename = core.getInput("filename");
    if (!filename) {
      filename = ".github/VERIFY_PR_COMMENT_TEMPLATE.md";
    }
    try {
      const file = tools.getFile(filename);
      if (file) {
        messageBody = file;
      } else {
        messageBody = defaultMessage;
      }
    } catch {
      messageBody = defaultMessage;
    }
  }

  log.debug(`Adding comment to PR. Comment text: ${messageBody}`);
  await github.issues.createComment({
    issue_number: context.payload.pull_request.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: messageBody,
  });
}

function extractIssues(body) {
  const re = /((\S+)\/(\S+))?#(\d+)\b/g;
  let match = re.exec(body);
  let matches = [];

  while (match !== null) {
    matches.push({
      owner: match[2],
      repo: match[3],
      issueNumber: match[4],
    });

    match = re.exec(body);
  }

  return matches;
}

async function getIssue(github, owner, repo, issueNumber) {
  return await github.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });
}

function checkIssue(issue, log) {
  if (!issue.body) {
    log.error("The issue body is empty.");
    return false;
  }

  if (issue.labels.length === 0) {
    log.error("The issue is not labeled.");
    return false;
  }

  if (!issue.milestone) {
    log.error("The issue is not linked to a milestone.");
    return false;
  }

  log.debug(`Issue #${issue.number} is valid!`);

  return true;
}

module.exports = { extractIssues, checkIssue };
