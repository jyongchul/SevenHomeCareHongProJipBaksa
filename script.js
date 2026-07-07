const year = document.querySelector("#year");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let blogPostsCache = [];
let archiveFilter = "all";
let archiveQuery = "";
let archiveLimit = 60;

function renderLatestPosts(posts) {
  const grid = document.querySelector("#latest-post-grid");
  if (!grid) return;

  grid.innerHTML = posts
    .slice(0, 6)
    .map(
      (post) => `
        <article class="latest-post-card">
          <div class="archive-meta">
            <span>${escapeHtml(post.brand)}</span>
            <time datetime="${escapeHtml(post.date_iso)}">${escapeHtml(post.date_text || post.date_iso)}</time>
          </div>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt)}</p>
          <a href="${escapeHtml(post.url)}" target="_blank" rel="noreferrer">원문 보기</a>
        </article>
      `,
    )
    .join("");
}

function archiveCard(post) {
  return `
    <article class="archive-card" data-brand="${escapeHtml(post.brand)}" data-tags="${escapeHtml(post.tags.join(" "))}">
      <div class="archive-meta">
        <span>${escapeHtml(post.brand)}</span>
        <time datetime="${escapeHtml(post.date_iso)}">${escapeHtml(post.date_text || post.date_iso)}</time>
      </div>
      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.excerpt)}</p>
      <div class="archive-tags">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <a href="${escapeHtml(post.url)}" target="_blank" rel="noreferrer">원문 보기</a>
    </article>
  `;
}

function filteredArchivePosts() {
  const query = archiveQuery.trim().toLowerCase();
  return blogPostsCache.filter((post) => {
    const brandOk = archiveFilter === "all" || post.brand === archiveFilter;
    if (!brandOk) return false;
    if (!query) return true;
    return `${post.title} ${post.brand} ${post.tags.join(" ")}`.toLowerCase().includes(query);
  });
}

function renderArchivePosts() {
  const grid = document.querySelector("#archive-grid");
  const count = document.querySelector("#archive-count");
  const more = document.querySelector("#archive-more");
  if (!grid) return;

  const filtered = filteredArchivePosts();
  const visible = filtered.slice(0, archiveLimit);
  grid.innerHTML = visible.map(archiveCard).join("");
  if (count) {
    count.textContent = `${filtered.length.toLocaleString("ko-KR")}건 중 ${visible.length.toLocaleString("ko-KR")}건 표시`;
  }
  if (more) {
    more.hidden = visible.length >= filtered.length;
  }
}

async function loadBlogPosts() {
  const needsPosts = document.querySelector("#latest-post-grid");
  const archiveGrid = document.querySelector("#archive-grid");
  if (!needsPosts && !archiveGrid) return;
  try {
    const response = await fetch("./assets/blog-posts.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();
    blogPostsCache = posts;
    renderLatestPosts(posts);
    renderArchivePosts();
  } catch {
    if (needsPosts) {
      needsPosts.innerHTML =
        '<article class="post-skeleton">블로그 포스팅 목록을 불러오지 못했습니다. 전체 아카이브를 확인해주세요.</article>';
    }
    if (archiveGrid) {
      archiveGrid.innerHTML = '<article class="post-skeleton">블로그 포스팅 목록을 불러오지 못했습니다.</article>';
    }
  }
}

function setupArchiveFilters() {
  const buttons = Array.from(document.querySelectorAll(".archive-filters button"));
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      archiveFilter = button.dataset.filter || "all";
      archiveLimit = 60;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      renderArchivePosts();
    });
  });
}

function setupArchiveSearch() {
  const input = document.querySelector("#archive-search");
  if (!input) return;
  input.addEventListener("input", () => {
    archiveQuery = input.value;
    archiveLimit = 60;
    renderArchivePosts();
  });
}

function setupArchiveMore() {
  const button = document.querySelector("#archive-more");
  if (!button) return;
  button.addEventListener("click", () => {
    archiveLimit += 60;
    renderArchivePosts();
  });
}

loadBlogPosts();
setupArchiveFilters();
setupArchiveSearch();
setupArchiveMore();
