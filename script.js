const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.classList.toggle("is-active");
  navLinks.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navLinks.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    menuToggle.classList.remove("is-active");
    navLinks.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }
});

function animateCounter(counter) {
  const endValue = Number(counter.dataset.counter);
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.round(endValue * eased).toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("is-visible");

    if (entry.target.querySelector("[data-counter]")) {
      counters.forEach((counter) => {
        if (!counter.dataset.started) {
          counter.dataset.started = "true";
          animateCounter(counter);
        }
      });
    }

    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.16 });

revealItems.forEach((item) => {
  if (prefersReducedMotion) {
    item.classList.add("is-visible");
  } else {
    revealObserver.observe(item);
  }
});

if (prefersReducedMotion) {
  counters.forEach((counter) => {
    counter.textContent = Number(counter.dataset.counter).toLocaleString();
  });
}

const filterButtons = document.querySelectorAll("[data-filter]");
const materialCards = document.querySelectorAll("[data-category]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    const filter = button.dataset.filter;
    materialCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const quoteForm = document.querySelector("[data-quote-form]");
const areaRange = document.querySelector("[data-area-range]");
const areaInput = document.querySelector("[data-area-input]");
const materialSelect = document.querySelector("[data-material-select]");
const deliveryInput = document.querySelector("[data-delivery]");
const estimateOutput = document.querySelector("[data-estimate]");

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function updateEstimate() {
  const area = Math.max(80, Math.min(2500, Number(areaInput.value || areaRange.value)));
  const rate = Number(materialSelect.value);
  const delivery = deliveryInput.checked ? 350 : 0;
  const subtotal = area * rate + delivery;
  const low = subtotal * 0.92;
  const high = subtotal * 1.18;

  areaRange.value = area;
  areaInput.value = area;
  estimateOutput.textContent = `${formatMoney(low)} - ${formatMoney(high)}`;
}

areaRange.addEventListener("input", () => {
  areaInput.value = areaRange.value;
  updateEstimate();
});

[areaInput, materialSelect, deliveryInput].forEach((control) => {
  control.addEventListener("input", updateEstimate);
  control.addEventListener("change", updateEstimate);
});

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

updateEstimate();

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "Enquiry ready. Masonry Masters will contact you with a consultation slot.";
  contactForm.reset();
});

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawBrick(ctx, x, y, width, height, color, mortar) {
  ctx.save();
  roundedRect(ctx, x, y, width, height, 4);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = mortar;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x + 6, y + 5, width - 12, 3);
  ctx.fillStyle = "rgba(50,20,10,0.14)";
  ctx.fillRect(x + 4, y + height - 5, width - 8, 2);
  ctx.restore();
}

function drawMaterial(canvas) {
  const { ctx, width, height } = setupCanvas(canvas);
  const type = canvas.dataset.texture;
  const random = seededRandom(type.length * 87);

  ctx.fillStyle = "#d7d0bf";
  ctx.fillRect(0, 0, width, height);

  if (type === "clay" || type === "block") {
    const brickH = type === "clay" ? 34 : 44;
    const brickW = type === "clay" ? 94 : 132;
    const colors = type === "clay"
      ? ["#9f4327", "#bf5b2e", "#d0743d", "#753722"]
      : ["#c7c5be", "#aaa79e", "#d8d6ce", "#8f918a"];

    for (let y = -brickH; y < height + brickH; y += brickH + 6) {
      const offset = Math.round(y / brickH) % 2 ? -brickW / 2 : 0;
      for (let x = offset; x < width + brickW; x += brickW + 6) {
        const color = colors[Math.floor(random() * colors.length)];
        drawBrick(ctx, x, y, brickW, brickH, color, "rgba(255,255,255,0.48)");
      }
    }
  }

  if (type === "slate" || type === "river" || type === "cobble") {
    const colors = {
      slate: ["#6d7470", "#a39a89", "#c2b49b", "#4f5957", "#97684b"],
      river: ["#c6b99f", "#8b928f", "#b9845f", "#d8d0bd", "#596461"],
      cobble: ["#5e6765", "#8c8272", "#c0ae91", "#6f5e53", "#3f484a"]
    }[type];

    for (let i = 0; i < 48; i += 1) {
      const x = random() * width;
      const y = random() * height;
      const r = 16 + random() * 42;
      ctx.beginPath();
      for (let p = 0; p < 8; p += 1) {
        const angle = (Math.PI * 2 * p) / 8;
        const jitter = 0.66 + random() * 0.48;
        const px = x + Math.cos(angle) * r * jitter;
        const py = y + Math.sin(angle) * r * 0.62 * jitter;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = colors[Math.floor(random() * colors.length)];
      ctx.fill();
      ctx.strokeStyle = "rgba(32,37,42,0.22)";
      ctx.stroke();
    }
  }

  if (type === "paver") {
    const colors = ["#bc7e48", "#7d8583", "#d2b16d", "#a85736"];
    const size = 58;
    for (let y = -size; y < height + size; y += size / 2 + 6) {
      for (let x = -size; x < width + size; x += size + 6) {
        const shift = Math.round(y / size) % 2 ? size / 2 : 0;
        ctx.save();
        ctx.translate(x + shift, y);
        ctx.rotate(Math.PI / 4);
        drawBrick(ctx, 0, 0, size, size / 2, colors[Math.floor(random() * colors.length)], "rgba(255,255,255,0.35)");
        ctx.restore();
      }
    }
  }

  const light = ctx.createLinearGradient(0, 0, width, height);
  light.addColorStop(0, "rgba(255,255,255,0.26)");
  light.addColorStop(0.52, "rgba(255,255,255,0)");
  light.addColorStop(1, "rgba(32,37,42,0.18)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);
}

function drawProject(canvas) {
  const { ctx, width, height } = setupCanvas(canvas);
  const scene = canvas.dataset.scene;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#e4ece8");
  sky.addColorStop(0.5, "#cbd2c7");
  sky.addColorStop(1, "#8f806c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  if (scene === "boundary") {
    ctx.fillStyle = "#6b5849";
    ctx.fillRect(0, height * 0.72, width, height * 0.28);
    for (let y = height * 0.32; y < height * 0.72; y += 28) {
      const row = Math.floor(y / 28);
      for (let x = row % 2 ? -55 : 0; x < width; x += 112) {
        drawBrick(ctx, x, y, 106, 24, ["#9e4628", "#bd5b31", "#d2723c"][row % 3], "rgba(247,242,232,0.5)");
      }
    }
    ctx.fillStyle = "#d5c7ad";
    ctx.fillRect(0, height * 0.28, width, 18);
  }

  if (scene === "facade") {
    ctx.fillStyle = "#ede7db";
    ctx.fillRect(width * 0.1, height * 0.08, width * 0.8, height * 0.84);
    const random = seededRandom(42);
    const colors = ["#766e61", "#a69682", "#c4b69d", "#5f6661", "#9b6b50"];
    for (let y = height * 0.1; y < height * 0.9; y += 26) {
      for (let x = width * 0.13; x < width * 0.87; x += 58 + random() * 26) {
        const w = 44 + random() * 56;
        ctx.fillStyle = colors[Math.floor(random() * colors.length)];
        ctx.fillRect(x, y, w, 20 + random() * 12);
        ctx.strokeStyle = "rgba(32,37,42,0.2)";
        ctx.strokeRect(x, y, w, 20 + random() * 12);
      }
    }
  }

  if (scene === "patio") {
    ctx.fillStyle = "#3f5e51";
    ctx.fillRect(0, 0, width, height * 0.36);
    ctx.save();
    ctx.translate(width * 0.5, height * 0.82);
    ctx.rotate(-0.28);
    for (let y = -height; y < height; y += 30) {
      for (let x = -width; x < width; x += 70) {
        const shift = Math.round(y / 30) % 2 ? 34 : 0;
        drawBrick(ctx, x + shift, y, 62, 24, ["#b26e45", "#c8a05b", "#76807f"][Math.abs(x + y) % 3], "rgba(255,255,255,0.42)");
      }
    }
    ctx.restore();
  }

  const shade = ctx.createLinearGradient(0, 0, width, height);
  shade.addColorStop(0, "rgba(255,255,255,0.18)");
  shade.addColorStop(1, "rgba(32,37,42,0.16)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
}

function redrawStaticCanvases() {
  document.querySelectorAll(".material-canvas").forEach(drawMaterial);
  document.querySelectorAll(".project-canvas").forEach(drawProject);
}

redrawStaticCanvases();

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    redrawStaticCanvases();
  }, 120);
});
