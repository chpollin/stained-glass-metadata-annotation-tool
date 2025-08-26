#!/usr/bin/env python3
"""
Simple HTTP server for testing the CVMA annotation tool
Run with: python server.py
"""

import http.server
import socketserver
import os
import webbrowser
from threading import Timer

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

def open_browser():
    webbrowser.open(f'http://localhost:{PORT}')

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Starting server at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        
        # Open browser after a short delay
        Timer(1.0, open_browser).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")
            httpd.shutdown()