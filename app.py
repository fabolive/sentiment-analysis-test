#
# Copyright 2014 IBM Corp. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
## -*- coding: utf-8 -*-

## Made changes to the original code to test MSF Azure Text Analytics API.
##

import os
import cherrypy
import requests
import json
import time
from mako.template import Template
from mako.lookup import TemplateLookup
import httplib, urllib, base64
import logging

headers = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': "c5f8eb22d7214d8f894e58e8bd9cb652",
}


class SentimentAnalysisService:
    """Wrapper on the Personality Insights service"""

    def __init__(self):
        """
        Construct an instance.
        """

        # Local variables
        self.url = 'https://westus.api.cognitive.microsoft.com'

    def getProfile(self, text):
        """Returns the profile by doing a POST to /v2/profile with text"""

        if self.url is None:
            raise Exception("No service is bound to this app")
 	body = '{"documents":[{"id":"1","text":"%s"}]}'%text
        print "URL" + self.url
        response = requests.post(self.url + "/text/analytics/v2.0/sentiment",
                          headers = headers,
                          json=json.loads(body)
                          )
        try:
            return json.loads(response.text)
        except:
            raise Exception("Error processing the request, HTTP: %d" % response.status_code)


class DemoService(object):
    """
    REST service/app. Since we just have 1 GET and 1 POST URLs,
    there is not even need to look at paths in the request.
    This class implements the handler API for cherrypy library.
    """
    exposed = True

    def __init__(self, service):
        self.service = service
        self.defaultContent = None
        try:
            contentFile = open("public/text/en.txt", "r")
            self.defaultContent = contentFile.read()
        except Exception as e:
            print "ERROR: couldn't read en.txt: %s" % e
        finally:
            contentFile.close()

    def GET(self):
        """Shows the default page with sample text content"""

        return lookup.get_template("index.html").render(content=self.defaultContent)


    def POST(self, text=None):
        """
        Send 'text' to the Personality Insights API
        and return the response.
        """
	try:
	    data = self.service.getProfile(text)
            print(data)
	    return json.dumps(data)
        except Exception as e:
            print("[Errno {0}] {1}".format(e.errno, e.strerror))


wsgi_app = cherrypy.Application(DemoService(sentimentAnalysis), "/", config=conf)

if __name__ == '__main__':
    lookup = TemplateLookup(directories=["templates"])

    # Get host/port from the Bluemix environment, or default to local
    #HOST_NAME = os.getenv("VCAP_APP_HOST", "127.0.0.1")
    HOST_NAME = '0.0.0.0'
    PORT_NUMBER = int(os.getenv("PORT", "10000"))
    cherrypy.config.update({
        "server.socket_host": HOST_NAME,
        "server.socket_port": PORT_NUMBER,
    })

    # Configure 2 paths: "public" for all JS/CSS content, and everything
    # else in "/" handled by the DemoService
    conf = {
        "/": {
            "request.dispatch": cherrypy.dispatch.MethodDispatcher(),
            "tools.response_headers.on": True,
            "tools.staticdir.root": os.path.abspath(os.getcwd())
        },
        "/public": {
            "tools.staticdir.on": True,
            "tools.staticdir.dir": "./public"
        }
    }

    try:
    	import http.client as http_client
    except ImportError:
    # Python 2
    	import httplib as http_client
    http_client.HTTPConnection.debuglevel = 1

    # You must initialize logging, otherwise you'll not see debug output.
    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.DEBUG)
    requests_log.propagate = True
    
    # Create the Sentiment Analysis Wrapper
    sentimentAnalysis = SentimentAnalysisService()
    
    # Start the server
    print("Listening on %s:%d" % (HOST_NAME, PORT_NUMBER))
    #cherrypy.quickstart(DemoService(sentimentAnalysis), "/", config=conf)
    from wsgiref.simple_server import make_server
    httpd = make_server('', PORT_NUMBER, wsgi_app)
    httpd.serve_forever()
