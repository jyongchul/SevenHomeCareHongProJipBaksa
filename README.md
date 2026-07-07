# SevenHomeCare HongPro Homepage

Static homepage for SevenHomeCare and HongProJipBaksa.

## Scope

- `index.html`, `styles.css`, and `script.js`
- `blog.html` blog list, generated `blog-pages/` posts, and public post index data
- Public homepage image assets only
- Public website assets only; internal notes and automation logs are kept outside this repository

## Refresh Blog Posts

Run from this repository root:

```bash
python3 tools/sync_naver_blog_full_posts.py --workers 8
```
