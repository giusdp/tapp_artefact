"use strict";

const superagent = require("superagent");

const callSlackApi = event => {
  return superagent
    .post(
      "https://hooks.slack.com/services/slackpath".replace(
        "slackpath",
        event.slackpath
      )
    )
    .send({ text: event.text })
    .set("Content-Type", "application/json");
};

module.exports.slack = async event => {
  await callSlackApi(event);
  return {
    statusCode: 201,
    body: JSON.stringify(
      {
        message: "Posted message to Slack API",
        input: event
      },
      null,
      2
    )
  };
};
