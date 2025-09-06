var http = require("http"),
  fs = require("fs"),
  ccav = require("./ccavutil.js"),
  qs = require("querystring");

exports.postReq = function (request, response, paymentData) {
  const workingKey = process.env.CCA_WORKING_KEY;
  const accessCode = process.env.CCA_ACCESS_CODE;
  const ccav = require("./ccavutil.js");
  const qs = require("querystring");

  // Convert JSON to query string
  const plainText = qs.stringify(paymentData);
  const encRequest = ccav.encrypt(plainText, workingKey);

  const escapeHTML = (str = "") => str.replace(/"/g, "&quot;");
  const formbody = `
    <form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
      <input type="hidden" id="encRequest" name="encRequest" value="${escapeHTML(encRequest)}">
      <input type="hidden" name="access_code" id="access_code" value="${escapeHTML(accessCode)}">
    </form>
    <script>document.forms["redirect"].submit();</script>
  `;

  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(formbody);
  response.end();
};
