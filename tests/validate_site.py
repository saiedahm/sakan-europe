from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

def require(condition, message):
    if not condition:
        errors.append(message)

homepage_path = ROOT / "index.html"
require(homepage_path.is_file(), "Missing index.html")
if homepage_path.is_file():
    html = homepage_path.read_text(encoding="utf-8")
    lowered = html.lower()
    for token, label in [
        ("<!doctype html>", "HTML5 doctype"),
        ('lang="ar"', "Arabic document language"),
        ('dir="rtl"', "right-to-left layout"),
        ("sakan europe", "SAKAN EUROPE brand"),
        ("سكن أوروبا", "Arabic brand name"),
        ('id="search-form"', "property search form"),
        ('id="property-cards"', "property cards"),
        ('id="country"', "country filter"),
        ('id="mode"', "sale/rent filter"),
        ("@media", "responsive CSS"),
        ("</html>", "closing HTML tag"),
    ]:
        require(token.lower() in lowered, f"Missing {label}")
    for tag in ("html", "head", "body", "main", "header", "footer", "style", "script"):
        opening = len(re.findall(fr"<{tag}(?:\s|>)", lowered))
        closing = len(re.findall(fr"</{tag}\s*>", lowered))
        require(opening == closing, f"Unbalanced {tag} tags: {opening} opening, {closing} closing")
    require("sakan-app" not in lowered, "Homepage must not link or refer to legacy app")
    require("example.com" not in lowered, "Replace placeholder example.com URLs before release")

for relative in ("properties.html", "contact.html", "login.html", "signup.html", "privacy.html", "terms.html", "404.html"):
    page = ROOT / relative
    require(page.is_file(), f"Missing {relative}")
    if page.is_file():
        page_html = page.read_text(encoding="utf-8").lower()
        require("<!doctype html>" in page_html, f"{relative} missing HTML5 doctype")
        require('lang="ar"' in page_html and 'dir="rtl"' in page_html, f"{relative} must use Arabic RTL")
        require("</html>" in page_html, f"{relative} missing closing html tag")

for relative in ("favicon.svg", "robots.txt", "sitemap.xml", ".github/workflows/validate.yml"):
    require((ROOT / relative).is_file(), f"Missing {relative}")

for relative in ("login.html", "signup.html"):
    page = ROOT / relative
    if page.is_file():
        page_html = page.read_text(encoding="utf-8").lower()
        require("لم يتم ربط" in page_html or "لم يُربط" in page_html or "لم يتم تفعيل" in page_html, f"{relative} must clearly disclose authentication is not active")

config_path = ROOT / "vercel.json"
require(config_path.is_file(), "Missing vercel.json")
if config_path.is_file():
    try:
        config = json.loads(config_path.read_text(encoding="utf-8"))
        require(isinstance(config, dict), "vercel.json must contain an object")
    except json.JSONDecodeError as exc:
        errors.append(f"Invalid vercel.json: {exc}")

if errors:
    print("SAKAN EUROPE validation failed:")
    for error in errors:
        print(f" - {error}")
    sys.exit(1)

print("SAKAN EUROPE validation passed.")
