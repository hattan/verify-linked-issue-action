# Verify Linked Issue Action
A GitHub action that verifies your pull request contains a reference to an issue. 

On a PR that does not include a linked issue or reference to an issue in the body, the check should fail and a comment will be added to the PR.

![Failing checks](images/failed-pr-body.png "Failing checks")

## Installation

### As a part of an existing workflow
``` yaml
- name: Verify Linked Issue
  uses: hattan/verify-linked-issue-action@v1.1.1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Pleasure ensure the following types on the pull_request triggers:
```yaml
  pull_request:
    types: [edited, synchronize, opened, reopened]
```

### As a separate workflow
* Ensure you have the folder .github/workflow
* In .github/workflow, place the [pr_verify_linked_issue.yml](example/pr_verify_linked_issue.yml) workflow.

### Inputs
(Optional) The action will add the following text to a PR when verification fails.
'Build Error! No Linked Issue found. Please link an issue or mention it in the body using #<issue_id>'

You can customize this message by providing an optional 'message' input with the string you would like to include as the comment.

```yaml
- name: Verify Linked Issue
  uses: hattan/verify-linked-issue-action@v1.1.1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    message: 'Error! This is a custom error'
 ```

### File Templates
If you want a more complex message, consider using a static template file. (Support for dynamic templates will be coming soon!)

There are two options when using template files:

* Option 1) Default File Path: Add a file to .github called VERIFY_PR_COMMENT_TEMPLATE.md. The content of this file will be used as the fail comment in the PR.
* Option 2) Speciy a filename input with the path to a template file. 
```yaml
- name: Verify Linked Issue
  uses: hattan/verify-linked-issue-action@v1.1.1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    filename: 'example/templates/fail_comment.txt'
```

## Trying it out

* Create a new pull request and take care to not include a linked item or mention an issue.
* The build should fail.
* Edit the PR body and add a reference to a valid issue (e.g. #123 )

![Failed Build log](images/failed1.png "Failed Build log")
## Known Issues
* There must be a space after the issue number (ie "#12 " not "#12".) This is due to the way the RegEx is structured and will be resolved in a future release.

* The Issue reference by # needs to be in the body, we don't currently look in the title. That is a future enhancement.

v1


