"""Run with: python -m pytest server  (or python server/test_main.py)"""

from fastapi import HTTPException
from fastapi.testclient import TestClient

from main import GITHUB_URL, app, repo_dir

client = TestClient(app)


def test_github_url():
    assert GITHUB_URL.match("https://github.com/pallets/click").group(1) == "click"
    assert GITHUB_URL.match("https://github.com/pallets/click.git/").group(1) == "click"
    for bad in ["http://github.com/a/b", "https://gitlab.com/a/b", "https://github.com/a", "https://github.com/a/b/tree/main"]:
        assert not GITHUB_URL.match(bad), bad


def test_repo_dir_blocks_traversal():
    for bad in ["..", ".git", "a/b", "a\\b", ""]:
        try:
            repo_dir(bad)
        except HTTPException as e:
            assert e.status_code == 400
        else:
            raise AssertionError(bad)


def test_routes_validate_input():
    assert client.get("/health").json() == {"ok": True}
    assert client.post("/map", json={"url": "nope"}).status_code == 400
    assert client.post("/ask", json={"repo": "x", "question": ""}).status_code == 400
    assert client.post("/ask", json={"repo": "never-mapped", "question": "hi"}).status_code == 404
    assert client.get("/graph/..").status_code in (400, 404)


if __name__ == "__main__":
    test_github_url()
    test_repo_dir_blocks_traversal()
    test_routes_validate_input()
    print("ok")
