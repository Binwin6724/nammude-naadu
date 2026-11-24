#!/usr/bin/env python3
"""Serves the game with caching turned off, so a normal reload always picks up the latest files."""
import http.server, functools, os, sys
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8417
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game')
class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()
http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(NoCache, directory=root)).serve_forever()
