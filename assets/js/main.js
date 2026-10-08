const root = document.documentElement;
const body = document.body;
const page = body.dataset.page;
const toast = document.querySelector("[data-toast]");

function icon(name) {
  const icons = {
    sun: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4V2M12 22v-2M4.93 4.93 3.51 3.51M20.49 20.49l-1.42-1.42M4 12H2M22 12h-2M4.93 19.07l-1.42 1.42M20.49 3.51l-1.42 1.42M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    moon: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 14.6A8.6 8.6 0 0 1 9.4 3 7 7 0 1 0 21 14.6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    menu: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    close: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  return icons[name] || "";
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.querySelectorAll("[data-photo]").forEach((slot) => {
  const src = slot.dataset.photo;
  if (!src) return;
  const probe = new Image();
  probe.onload = () => {
    slot.style.backgroundImage = `url("${src}")`;
    slot.classList.add("has-photo");
    slot.setAttribute("aria-label", slot.dataset.alt || "Portfolio photograph");
  };
  probe.onerror = () => {
    slot.classList.add("missing-photo");
  };
  probe.src = src;
});

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("tania-theme", theme);
  const themeButton = document.querySelector("[data-theme-toggle]");
  if (themeButton) {
    themeButton.innerHTML = theme === "dark" ? icon("sun") : icon("moon");
    themeButton.setAttribute("aria-label", theme === "dark" ? "Use light theme" : "Use dark theme");
  }
}

const savedTheme = localStorage.getItem("tania-theme");
const preferredDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (preferredDark ? "dark" : "light"));

document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
});

const menuButton = document.querySelector("[data-menu-toggle]");
if (menuButton) {
  menuButton.innerHTML = icon("menu");
  menuButton.addEventListener("click", () => {
    const open = body.classList.toggle("menu-open");
    menuButton.innerHTML = open ? icon("close") : icon("menu");
    menuButton.setAttribute("aria-expanded", String(open));
  });
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  const targetPage = link.dataset.page;
  if (targetPage === page) {
    link.setAttribute("aria-current", "page");
  }
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    if (menuButton) {
      menuButton.innerHTML = icon("menu");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
});

const progress = document.querySelector("[data-progress]");
function updateProgress() {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, value))}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const revealItems = document.querySelectorAll(".reveal, .skill-card");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

function animateCounter(el) {
  const target = Number(el.dataset.count || 0);
  const decimals = Number(el.dataset.decimals || 0);
  const suffix = el.dataset.suffix || "";
  const duration = 1000;
  const start = performance.now();

  function tick(now) {
    const progressValue = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    const value = target * eased;
    el.textContent = `${value.toFixed(decimals)}${suffix}`;
    if (progressValue < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counters = document.querySelectorAll("[data-count]");
if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.45 });
  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(animateCounter);
}

document.querySelectorAll("[data-skill-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.skillFilter;
    document.querySelectorAll("[data-skill-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelectorAll("[data-skill-type]").forEach((card) => {
      const values = card.dataset.skillType.split(" ");
      card.classList.toggle("is-hidden", filter !== "all" && !values.includes(filter));
    });
  });
});

document.querySelectorAll("[data-workflow-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.workflowTab;
    document.querySelectorAll("[data-workflow-tab]").forEach((item) => item.classList.remove("is-active"));
    document.querySelectorAll("[data-workflow-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.workflowPanel === target);
    });
    tab.classList.add("is-active");
  });
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      showToast("Copied to clipboard.");
    } catch {
      showToast(value);
    }
  });
});

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "Portfolio inquiry").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      showToast("Please complete name, email, and message.");
      return;
    }

    const bodyText = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href = `mailto:tanjinjahan165@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    showToast("Opening your email app.");
    contactForm.reset();
  });
}

document.querySelectorAll("[data-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});
