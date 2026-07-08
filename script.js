const year = document.querySelector("#year");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function postHref(post) {
  return post.page_path ? `./${post.page_path}` : post.url;
}

function renderLatestPosts(posts) {
  const grid = document.querySelector("#latest-post-grid");
  if (!grid) return;

  grid.innerHTML = posts
    .slice(0, 6)
    .map((post) => {
      const image = post.thumbnail
        ? `<img src="${escapeHtml(post.thumbnail)}" alt="${escapeHtml(post.title)}" loading="lazy" referrerpolicy="no-referrer" />`
        : `<div class="blog-card-placeholder">7</div>`;
      return `
        <article class="latest-post-card">
          <a href="${escapeHtml(postHref(post))}">
            <div class="latest-post-media">
              ${image}
              <span>${escapeHtml(post.category || post.tags?.[0] || "생활보수")}</span>
            </div>
            <div class="archive-meta">
              <span>${escapeHtml(post.brand)}</span>
              <time datetime="${escapeHtml(post.date_iso)}">${escapeHtml(post.date_text || post.date_iso)}</time>
            </div>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.excerpt)}</p>
          </a>
        </article>
      `;
    })
    .join("");
}

async function loadLatestPosts() {
  const grid = document.querySelector("#latest-post-grid");
  if (!grid) return;

  try {
    const response = await fetch("./assets/blog-posts.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();
    renderLatestPosts(posts);
  } catch {
    grid.innerHTML = '<article class="post-skeleton">블로그 글 목록을 불러오지 못했습니다.</article>';
  }
}

function setupBlogFilters() {
  const grid = document.querySelector("#blog-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".blog-card"));
  const buttons = Array.from(document.querySelectorAll(".blog-filter"));
  const search = document.querySelector("#blog-search");
  const count = document.querySelector("#blog-count");
  const params = new URLSearchParams(window.location.search);
  const initialFilter = params.get("filter") || "all";
  const knownFilters = new Set(buttons.map((button) => button.dataset.filter || "all"));
  let filter = knownFilters.has(initialFilter) ? initialFilter : "all";

  if (search && params.get("q")) {
    search.value = params.get("q");
  }

  buttons.forEach((button) => {
    button.classList.toggle("active", (button.dataset.filter || "all") === filter);
  });

  function applyFilters() {
    const query = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const brand = card.dataset.brand || "";
      const category = card.dataset.category || "";
      const haystack = (card.dataset.search || card.textContent || "").toLowerCase();
      const filterOk = filter === "all" || brand === filter || category === filter;
      const queryOk = !query || haystack.includes(query);
      const show = filterOk && queryOk;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (count) {
      count.textContent = `${visible.toLocaleString("ko-KR")}건`;
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      filter = button.dataset.filter || "all";
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      const url = new URL(window.location.href);
      if (filter === "all") {
        url.searchParams.delete("filter");
      } else {
        url.searchParams.set("filter", filter);
      }
      window.history.replaceState({}, "", url);
      applyFilters();
    });
  });

  if (search) {
    search.addEventListener("input", applyFilters);
  }

  applyFilters();
}

loadLatestPosts();
setupBlogFilters();
