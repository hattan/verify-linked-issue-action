# Verify Linked Issue Action
A GitHub action that verifies your pull request contains a reference to an issue. 

On a PR that does not include a linked issue or reference to an issue in the body, the check should fail and a comment will be added to the PR.

![Failing checks](images/failed-pr-body.png "Failing checks")

## Installation

### As a part of an existing workflow
``` 
- name: Verify Linked Issue
  uses: hattan/verify-linked-issue-action@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Pleasure ensure the following types on the pull_request triggers:
```
  pull_request:
    types: [edited, synchronize, opened, reopened]
```

### As a separate workflow
* Ensure you have the folder .github/workflow
* In .github/workflow, place the [pr_verify_linked_issue.yml](example/pr_verify_linked_issue.yml) workflow.

## Trying it out

* Create a new pull request and take care to not include a linked item or mention an issue.
* The build should fail.
* Edit the PR body and add a reference to a valid issue (e.g. #123 )

![Failed Build log](images/failed1.png "Failed Build log")
## Known Issues
* There must be a space after the issue number (ie "#12 " not "#12".) This is due to the way the RegEx is structured and will be resolved in a future release.

* The Issue reference by # needs to be in the body, we don't currently look in the title. That is a future enhancement.


