import http.server
import os
import functools


def main(port: int = 8080) -> None:
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=static_dir)
    server = http.server.HTTPServer(("0.0.0.0", port), handler)
    print(f"[canvas-simulator] serving at http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[canvas-simulator] shutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
