 
const core = require('@actions/core')
const github = require('@actions/github');
const context = github.context;


async function verifyLinkedIssue() {
  let linkedIssue = await checkBodyForValidIssue(context, github);
  if (!linkedIssue) {
    linkedIssue = await checkEventsListForConnectedEvent(context, github);
  }

  if(linkedIssue){
    core.success("Success! Linked Issue Found!");
  }
  else{
      await createMissingIssueComment(context, github);
      core.error("No Linked Issue Found!");
      core.setFailed("No Linked Issue Found!");
  }
}

async function checkBodyForValidIssue(context, github){
  let body = context.payload.pull_request.body;
  core.debug(`Checking PR Body: "${body}"`)
  const re = /#(.*?)[\s]/g;
  const matches = body.match(re);
  core.debug(`regex matches: ${matches}`)
  if(matches){
    for(let i=0,len=matches.length;i<len;i++){
      let match = matches[i];
      let issueId = match.replace('#','').trim();
      core.debug(`verfiying match is a valid issue issueId: ${issueId}`)
      try{
        let issue = await github.issues.get({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issueId,
        });
        if(issue){
          core.debug(`Found issue in PR Body ${issueId}`);
          return true;
        }
      }
      catch{
        core.debug(`#${issueId} is not a valid issue.`);
      }
    }
  }
  return false;
}

async function checkEventsListForConnectedEvent(context, github){
  let pull = await github.issues.listEvents({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.pull_request.number 
  });

  if(pull.data){
    core.debug(`Checking events: ${pull.data}`)
    pull.data.forEach(item => {
      if (item.event == "connected"){
        core.debug(`Found connected event.`);
        return true;
      }
    });
  }
  return false;
}

async function createMissingIssueComment(context,github ) {
  const defaultMessage =  'Build Error! No Linked Issue found. Please link an issue or mention it in the body using #<issue_id>';
  let messageBody = core.getInput('message');
  if(!messageBody){
    let filename = core.getInput('filename');
    if(!filename){
      filename = '.github/VERIFY_PR_COMMENT_TEMPLATE.md';
    }
    messageBody=defaultMessage;
    // try{
    //   const file = tools.getFile(filename);
    //   if(file){
    //     messageBody = file;
    //   }
    //   else{
    //     messageBody = defaultMessage;
    //   }
    // }
    // catch{
    //   messageBody = defaultMessage;
    // }
  }

  core.debug(`Adding comment to PR. Comment text: ${messageBody}`);
  await github.issues.createComment({
    issue_number: context.payload.pull_request.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: messageBody
  });
}

async function run() {

  try {
    if(!context.payload.pull_request){
        core.info('Not a pull request skipping verification!');
        return;
    }

    core.debug('Starting Linked Issue Verification!');
    await verifyLinkedIssue();
    
  } catch (err) {
    core.error(`Error verifying linked issue.`)
    core.error(err)

    if (err.errors) core.error(err.errors)
    const errorMessage = "Error verifying linked issue."
    core.setFailed(errorMessage + '\n\n' + err.message)
  }

}

run();
