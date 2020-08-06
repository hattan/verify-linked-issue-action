const assert = require("assert");

const { extractIssues, checkIssue } = require("../src/index");

assert.deepStrictEqual(extractIssues("Closes owner/repo#944")[0], {
  owner: "owner",
  repo: "repo",
  issueNumber: "944",
});

assert.deepStrictEqual(extractIssues("Closes owner/repo#944\n")[0], {
  owner: "owner",
  repo: "repo",
  issueNumber: "944",
});

assert.deepStrictEqual(extractIssues("Closes owner/repo#944 ")[0], {
  owner: "owner",
  repo: "repo",
  issueNumber: "944",
});

assert.deepStrictEqual(
  extractIssues("Closes owner_with_underscore/repo-with-dash#944")[0],
  {
    owner: "owner_with_underscore",
    repo: "repo-with-dash",
    issueNumber: "944",
  }
);

assert.deepStrictEqual(extractIssues("Closes #944")[0], {
  owner: undefined,
  repo: undefined,
  issueNumber: "944",
});

assert(!checkIssue({ body: "", labels: [], milestone: null }, console));

assert(!checkIssue({ body: "Body", labels: [], milestone: null }, console));

assert(!checkIssue({ body: "Body", labels: [{}], milestone: null }, console));

assert(
  checkIssue({ body: "Body", labels: [{}], milestone: {}, number: 5 }, console)
);
