/**
 * Created by k33g on 6/28/16.
 */

"use strict";
const config = require('./config.js');
const githubHook = require('githubHook'); // listen to webhooks
const octonode = require('octonode'); // needed to play with GitHub API
const tools = require('./tools.js');
const chalk = require('chalk');

const hubber = octonode.client({
  username: config.username,
  password: config.password
},{
  protocol: config.protocol,
  hostname: config.hostname
});

const github = githubHook({
  port: config.httpPort,
  path: config.payLoadUrl
});

github.listen();

github.on('*', (event, repo, ref, data) => {
  
  switch (event) {
    case 'pull_request':
      switch (data.action) {
        case 'opened':
          break;
        case 'synchronize':

          let statuesUrl = data.pull_request.statuses_url;

          hubber.post(statuesUrl, {
            state:"pending",
            description:"checking...",
            context: "octo-ci-js"
          }, (err, status, body, headers)=> {

            tools.sleep(8000);
            let rnd = tools.random(1,10);

            if(rnd>5) {
              console.log(chalk.green("SUCCESS!!!"));
              
              hubber.post(statuesUrl, {
                state:"success",
                description:"you are the best!",
                context: "octo-ci-js"
              }, (err, status, body, headers)=> {});
              
            } else {
              console.log(chalk.red("FAILURE!!!"));

              hubber.post(statuesUrl, {
                state:"failure",
                description:"Ouch!",
                context: "octo-ci-js"
              }, (err, status, body, headers)=> {});
              
            }
          });
          
          break;
        case 'closed':
          console.log(chalk.blue("DEPLOYMENT???"));
          break;
        default:
          console.log(data.action);
      }
      break;
    default:
      console.log(event);
  }

});