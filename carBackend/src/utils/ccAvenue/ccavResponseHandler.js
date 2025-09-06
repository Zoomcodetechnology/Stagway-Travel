var http = require('http'),
    fs = require('fs'),
    ccav = require('./ccavutil.js'),
    qs = require('querystring');

	exports.postRes = function (req, res) {
		try {
		  const workingKey = '818FA45823E28C823B6591D23F38FFC2'; // Use env in prod
	  
		  const { encResp } = req.body;
		  if (!encResp) {
			return res.status(400).send("Missing encResp from CC Avenue");
		  }
	  
		  const ccavResponse = ccav.decrypt(encResp, workingKey);
		  const parsedData = qs.parse(ccavResponse); // Convert to object
	  
		  // Optional: HTML response if required (like original)
		  let pData = '<table border=1 cellspacing=2 cellpadding=2><tr><td>';
		  pData += ccavResponse.replace(/=/gi, '</td><td>')
							   .replace(/&/gi, '</td></tr><tr><td>');
		  pData += '</td></tr></table>';
	  
		  const htmlcode = `
			<html><head><meta charset="UTF-8"><title>Response Handler</title></head>
			<body><center>
			  <font size="4" color="blue"><b>Response Page</b></font><br>${pData}
			</center></body></html>`;
	  
		  res.writeHead(200, { "Content-Type": "text/html" });
		  res.write(htmlcode);
		  res.end();
	  
		  // ⚠️ You can also return `parsedData` if you want to use it programmatically
		  return parsedData;
		} catch (error) {
		  console.error("postRes error:", error);
		  res.status(500).send("Something went wrong");
		}
	  };
