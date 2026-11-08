// Premium portfolio interactions: canvas network, reveal-on-scroll, filters, project case studies.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const preloader = document.querySelector(".preloader");
window.addEventListener("load", () => setTimeout(() => preloader.classList.add("done"), reduceMotion ? 0 : 850));

document.querySelector("#year").textContent = new Date().getFullYear();

// Mobile navigation
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation menu");
}));

// Scroll reveal
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12, rootMargin: "0px 0px -35px 0px"});
  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add("visible"));
}

// Handle SVG packet animations with accessibility and motion controls
const enterpriseSvg = document.getElementById("enterprise-svg");
if (reduceMotion && enterpriseSvg && typeof enterpriseSvg.pauseAnimations === "function") {
  enterpriseSvg.pauseAnimations();
}

// Scroll progress & Smart Navbar (Hide on scroll down, slim on scroll, reveal on scroll up)
const topbar = document.querySelector(".topbar");
const progressBar = document.querySelector(".scroll-progress");
let lastScrollY = window.scrollY;
let scrollTicking = false;

function onScroll() {
  const currentY = window.scrollY;

  // 1. Progress bar
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (currentY / docHeight) * 100 : 0;
  progressBar.style.width = pct + "%";

  // 2. Slim mode when scrolled past 60px
  if (currentY > 60) {
    topbar.classList.add("topbar-scrolled");
  } else {
    topbar.classList.remove("topbar-scrolled");
  }

  // 3. Smart Hide: hide when scrolling down past 160px; reveal immediately when scrolling up
  const isMobileNavOpen = nav && nav.classList.contains("open");
  if (!isMobileNavOpen) {
    if (currentY > 160 && currentY > lastScrollY + 6) {
      topbar.classList.add("topbar-hidden");
    } else if (currentY < lastScrollY - 6 || currentY <= 160) {
      topbar.classList.remove("topbar-hidden");
    }
  }

  lastScrollY = Math.max(0, currentY);
  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(onScroll);
    scrollTicking = true;
  }
}, {passive: true});

// Scroll-spy: highlight active nav link based on section in view
const navLinks = document.querySelectorAll(".main-nav a[href^='#']");
const sections = Array.from(navLinks)
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

function updateActiveNav() {
  const scrollMid = window.scrollY + window.innerHeight / 3;
  let current = null;
  if (window.scrollY > 150) {
    sections.forEach(sec => {
      if (sec && sec.offsetTop <= scrollMid) current = sec;
    });
  }
  navLinks.forEach(a => {
    const isActive = Boolean(current && a.getAttribute("href") === "#" + current.id);
    a.classList.toggle("nav-active", isActive);
  });
}
window.addEventListener("scroll", updateActiveNav, {passive: true});
updateActiveNav();

// Project filters — instant filtering with smooth entry animation
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach(button => button.addEventListener("click", () => {
  filterButtons.forEach(b => {
    const selected = b === button;
    b.classList.toggle("active", selected);
    b.setAttribute("aria-pressed", String(selected));
  });
  const filter = button.dataset.filter;
  projectCards.forEach(card => {
    const matches = filter === "all" || card.dataset.category === filter;
    if (matches) {
      card.classList.remove("hidden");
      card.classList.remove("filter-anim");
      void card.offsetWidth; // Re-trigger smooth CSS entry animation
      card.classList.add("filter-anim");
    } else {
      card.classList.add("hidden");
      card.classList.remove("filter-anim");
    }
  });
}));

// Case study content: keep claims precise; distinguish design intent from verified deployment.
const projects = {
  enterprise: {
    kicker: "01 / NETWORK ENGINEERING · FLAGSHIP",
    title: "Enterprise Hybrid Network Architecture",
    summary: "A multi-site enterprise network design connecting headquarters, a branch office and an ISP segment. The project explores how an organisation can segment users, provide shared services and control traffic between sites.",
    idea: "The topology includes HQ and branch routers, access/distribution switches, departmental endpoints and internal/public services. The documented work covers VLAN segmentation, OSPF routing, DHCP, DNS/internal HTTP, NAT/PAT, extended ACLs and SSH administration. GRE-based remote-access simulation is also part of the project context. IPsec and full remote-access VPN operation are documented as requiring a suitable GNS3/EVE-NG environment for validation.",
    tags: ["Cisco Packet Tracer","GNS3 / EVE-NG","OSPF","VLANs","DHCP / DNS","NAT / PAT","ACLs","SSH","GRE"],
    note: "Implementation evidence and test results should be attached before claiming full production validation.",
    github: "https://github.com/RathinRH/Enterprise-Hybrid-Network-Architecture",
    download: "https://github.com/RathinRH/Enterprise-Hybrid-Network-Architecture/archive/refs/heads/main.zip"
  },
  automation: {
    kicker: "02 / NETWORK ENGINEERING · AUTOMATION",
    title: "Network Automation & Provisioning",
    summary: "A Python framework that reduces repetitive network administration by automating configuration backups and reusable configuration deployment over SSH.",
    idea: "The visible main workflow loads a YAML device inventory, backs up running configurations, renders a guest-network template with Jinja2 and submits deployment tasks concurrently using ThreadPoolExecutor. Netmiko provides the SSH/device interaction layer. Supporting documentation describes compliance checks, notifications and a Flask dashboard; those supporting modules should be demonstrated separately before describing them as verified end-to-end features.",
    tags: ["Python","Netmiko","SSH","YAML","Jinja2","ThreadPoolExecutor","Flask"],
    note: "A dry run validates the rendered workflow, not a real device configuration change.",
    github: "https://github.com/RathinRH/Network-Automation-and-Provisioning"
  },
  "resume-ai": {
    kicker: "03 / FULL-STACK DEVELOPMENT · WEB APPLICATION",
    title: "AI Resume Screening & Job Matching",
    summary: "A recruiter-focused full-stack application that extracts resume content and compares candidate profiles with job requirements using skills and experience matching logic.",
    idea: "The frontend supports resume upload, analysis feedback and recruiter-facing match views. The backend uses Java Spring Boot, Apache Tika for document text extraction and Spring Data JPA for persistence. The matching logic gives higher weight to must-have skills, considers nice-to-have skills and checks minimum experience. H2 is used for development, with Oracle support documented. The matching engine is rule-based/semi-semantic; it should not be described as a trained AI model unless a separate ML component is verified.",
    tags: ["Java","Spring Boot","Apache Tika","Spring Data JPA","H2","Oracle support","HTML / CSS / JavaScript"],
    note: "Describe the scoring method accurately; avoid implying an LLM or trained model if one is not implemented.",
    github: "https://github.com/RathinRH/AI-Resume-Screening-Job-Matching-System"
  },
  acoustic: {
    kicker: "04 / ARTIFICIAL INTELLIGENCE · DEEP LEARNING",
    title: "Acoustic Heart–Lung Sound Classification",
    summary: "A deep-learning project designed to classify cardiopulmonary sound recordings and explore patterns in acoustic signals.",
    idea: "The documented approach uses audio preprocessing and Log-Mel spectrogram feature extraction, followed by a hybrid CNN–BiLSTM architecture to learn spectral and temporal patterns. The end-to-end workflow covers preprocessing, feature extraction, model training and performance evaluation. Add the dataset, class labels, evaluation metrics and reproducible results to the case study when you have the verified experiment details.",
    tags: ["Python","TensorFlow","Keras","Librosa","Log-Mel Spectrograms","CNN–BiLSTM"],
    note: "This is a research/educational classification project, not a clinically validated diagnostic tool.",
    github: "https://github.com/RathinRH/ACOUSTIC-HEART-LUNG-NOISE-CLASSIFICATION-SYSTEM-USING-DEEP-LEARNING"
  }
};
const modal = document.querySelector("#project-modal");
const modalClose = document.querySelector(".modal-close");
const modalGithub = document.querySelector("#modal-github");
const modalDownload = document.querySelector("#modal-download");

function openProjectModal(key) {
  const data = projects[key];
  if (!data || !modal) return;
  document.querySelector("#modal-kicker").textContent = data.kicker;
  document.querySelector("#modal-title").textContent = data.title;
  document.querySelector("#modal-summary").textContent = data.summary;
  document.querySelector("#modal-idea").textContent = data.idea;
  document.querySelector("#modal-note").textContent = data.note;
  if (modalGithub) {
    modalGithub.href = data.github || "#";
    modalGithub.style.display = data.github ? "" : "none";
  }
  if (modalDownload) {
    if (data.download) {
      modalDownload.href = data.download;
      modalDownload.style.display = "";
    } else {
      modalDownload.style.display = "none";
    }
  }
  const tagBox = document.querySelector("#modal-tags");
  tagBox.replaceChildren(...data.tags.map(tag => {
    const el = document.createElement("span"); el.textContent = tag; return el;
  }));
  modal.showModal();
  document.body.classList.add("modal-open");
}

document.querySelectorAll("[data-open]").forEach(button => {
  button.addEventListener("click", e => {
    e.stopPropagation();
    openProjectModal(button.dataset.open);
  });
});

// Allow clicking anywhere on the project card to open case study
projectCards.forEach(card => {
  card.addEventListener("click", e => {
    if (e.target.closest("a")) return; // Let direct repo links navigate
    const projectKey = card.dataset.project;
    if (projectKey) openProjectModal(projectKey);
  });
});
function closeModal(){modal.close();document.body.classList.remove("modal-open");}
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
modal.querySelector(".modal-contact").addEventListener("click", closeModal);

// Motion preference control
const motionButton = document.querySelector(".motion-toggle");
motionButton.addEventListener("click", () => {
  const paused = document.body.classList.toggle("motion-paused");
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.querySelector("span").textContent = paused ? "▶" : "Ⅱ";
  motionButton.title = paused ? "Resume decorative motion" : "Pause decorative motion";
  if (!paused && !reduceMotion) requestAnimationFrame(drawNetwork);
  if (enterpriseSvg && typeof enterpriseSvg.pauseAnimations === "function") {
    if (paused) enterpriseSvg.pauseAnimations();
    else if (!reduceMotion) enterpriseSvg.unpauseAnimations();
  }
});

// Premium interactive custom cursor (Desktop pointer:fine only)
const glow = document.querySelector(".cursor-glow");
const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");

if (window.matchMedia("(pointer:fine)").matches && !reduceMotion && dot && ring) {
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let glowX = -100, glowY = -100;
  let isVisible = false;

  window.addEventListener("pointermove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
      if (glow) glow.style.opacity = "1";
    }
    // Immediate pinpoint response for the inner laser dot
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }, {passive: true});

  document.addEventListener("pointerleave", () => {
    isVisible = false;
    dot.style.opacity = "0";
    ring.style.opacity = "0";
    if (glow) glow.style.opacity = "0";
  });

  function renderCursor() {
    if (isVisible) {
      // Silky smooth trailing physics for the outer ring & ambient glow
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      if (glow) {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }
    }
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Interactive hover states on all interactive elements
  const interactiveSelector = "a, button, [role='button'], input, .project-card, .cert-card, .filter-btn, .round-link, .modal-close, .modal-pkt-btn, .card-ext-link, .manifesto-pill";
  document.addEventListener("mouseover", e => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.add("cursor-hover");
    }
    if (e.target.closest(".manifesto")) {
      document.body.classList.add("cursor-in-manifesto");
    }
  });
  document.addEventListener("mouseout", e => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.remove("cursor-hover");
    }
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(".manifesto")) {
      document.body.classList.remove("cursor-in-manifesto");
    }
  });

  // Click spring bounce
  window.addEventListener("mousedown", () => document.body.classList.add("cursor-clicking"));
  window.addEventListener("mouseup", () => document.body.classList.remove("cursor-clicking"));
}

// ── Hero Interactive Spotlight Reveal (Profile in Darkness) ───────────
const heroSpotlight = document.querySelector("#hero-spotlight");
const heroSection = document.querySelector(".hero");

if (heroSpotlight && window.matchMedia("(pointer:fine)").matches) {
  let isHovering = false;
  let targetX = -999, targetY = -999;
  let currentX = -999, currentY = -999;

  function updateSpotlight() {
    if (isHovering) {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      heroSpotlight.style.setProperty("--spot-x", `${currentX.toFixed(1)}px`);
      heroSpotlight.style.setProperty("--spot-y", `${currentY.toFixed(1)}px`);
    }
    requestAnimationFrame(updateSpotlight);
  }
  requestAnimationFrame(updateSpotlight);

  if (heroSection) {
    heroSection.addEventListener("pointermove", (e) => {
      const rect = heroSpotlight.getBoundingClientRect();
      const pad = 35;
      const isInside = (
        e.clientX >= rect.left - pad &&
        e.clientX <= rect.right + pad &&
        e.clientY >= rect.top - pad &&
        e.clientY <= rect.bottom + pad
      );

      if (isInside) {
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        targetX = relX;
        targetY = relY;

        if (!isHovering) {
          isHovering = true;
          currentX = relX;
          currentY = relY;
          heroSpotlight.style.setProperty("--spot-x", `${currentX.toFixed(1)}px`);
          heroSpotlight.style.setProperty("--spot-y", `${currentY.toFixed(1)}px`);
          heroSpotlight.classList.add("active");
          document.body.classList.add("cursor-in-spotlight");
        }
      } else if (isHovering) {
        isHovering = false;
        heroSpotlight.classList.remove("active");
        document.body.classList.remove("cursor-in-spotlight");
      }
    }, { passive: true });

    heroSection.addEventListener("pointerleave", () => {
      if (isHovering) {
        isHovering = false;
        heroSpotlight.classList.remove("active");
        document.body.classList.remove("cursor-in-spotlight");
      }
    });
  }
}

// Interactive canvas network. Nodes drift gently and respond to pointer position.
const canvas = document.querySelector("#network-canvas");
const ctx = canvas.getContext("2d");
let width = 0, height = 0, points = [], pointer = {x:-1000,y:-1000};
const pointCount = window.innerWidth < 700 ? 34 : 68;
function resizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth; height = canvas.clientHeight;
  canvas.width = Math.floor(width*dpr); canvas.height = Math.floor(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  points = Array.from({length:pointCount},(_,i)=>({
    x:Math.random()*width, y:Math.random()*height,
    vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22,
    r:i%9===0?2.3:1.15, phase:Math.random()*Math.PI*2
  }));
}
function drawNetwork(){
  if (document.body.classList.contains("motion-paused") || reduceMotion) return;
  ctx.clearRect(0,0,width,height);
  const maxDist = width < 700 ? 105 : 145;
  points.forEach((p,i)=>{
    p.x += p.vx; p.y += p.vy; p.phase += .012;
    if(p.x<0||p.x>width)p.vx*=-1;
    if(p.y<0||p.y>height)p.vy*=-1;
    const dx=pointer.x-p.x,dy=pointer.y-p.y,dist=Math.hypot(dx,dy);
    if(dist>0 && dist<130){p.x-=dx/dist*.12;p.y-=dy/dist*.12;}
    for(let j=i+1;j<points.length;j++){
      const q=points[j],d=Math.hypot(p.x-q.x,p.y-q.y);
      if(d<maxDist){
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
        ctx.strokeStyle=`rgba(145,211,151,${(1-d/maxDist)*.23})`;ctx.lineWidth=.7;ctx.stroke();
      }
    }
    ctx.beginPath();ctx.arc(p.x,p.y,p.r+Math.sin(p.phase)*.35,0,Math.PI*2);
    ctx.fillStyle=i%9===0?"rgba(201,243,107,.85)":"rgba(157,201,166,.6)";ctx.fill();
  });
  requestAnimationFrame(drawNetwork);
}
canvas.addEventListener("pointermove",e=>{const r=canvas.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};});
canvas.addEventListener("pointerleave",()=>pointer={x:-1000,y:-1000});
if(!reduceMotion){resizeCanvas();drawNetwork();window.addEventListener("resize",resizeCanvas);}
else{canvas.style.display="none";}

// ── Toast Notification Helper ──────────────────────────────────────────
const toastEl = document.querySelector("#toast");
let toastTimeout;
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove("show"), 2800);
}

// ── Copy Email to Clipboard ──────────────────────────────────────────
const copyBtn = document.querySelector(".contact-copy-email");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.dataset.email || "rathindraranjit@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      showToast(`Copied to clipboard: ${email}`);
    } catch {
      showToast(`Email: ${email}`);
    }
  });
}

// ── Interactive Terminal CLI ──────────────────────────────────────────
const cliModal = document.querySelector("#cli-modal");
const cliToggle = document.querySelector(".cli-toggle");
const cliClose = document.querySelector(".cli-close");
const cliForm = document.querySelector("#cli-form");
const cliInput = document.querySelector("#cli-input");
const cliOutput = document.querySelector("#cli-output");

function openCLI() {
  if (!cliModal) return;
  cliModal.showModal();
  document.body.classList.add("modal-open");
  setTimeout(() => cliInput && cliInput.focus(), 60);
}

function closeCLI() {
  if (!cliModal) return;
  cliModal.close();
  document.body.classList.remove("modal-open");
}

if (cliToggle) cliToggle.addEventListener("click", openCLI);
if (cliClose) cliClose.addEventListener("click", closeCLI);
if (cliModal) {
  cliModal.addEventListener("click", e => { if (e.target === cliModal) closeCLI(); });
}

// Keyboard shortcut: pressing ` (backtick) or ~ opens/closes the terminal
window.addEventListener("keydown", e => {
  if (e.key === "`" || e.key === "~") {
    // Don't trigger if user is typing in an input
    if (document.activeElement && document.activeElement.tagName === "INPUT") return;
    e.preventDefault();
    if (cliModal && cliModal.open) closeCLI();
    else openCLI();
  }
});

const CLI_COMMANDS = {
  help: () => `
<span class="cli-highlight">AVAILABLE COMMANDS:</span>
  <span class="cli-cyan">whoami</span>        - Display operator profile & background
  <span class="cli-cyan">skills</span>        - List core networking and technical toolkit
  <span class="cli-cyan">ping</span>          - Ping an enterprise core host or gateway
  <span class="cli-cyan">traceroute</span>    - Trace packets across hybrid topology
  <span class="cli-cyan">show ip route</span> - Show current routing table
  <span class="cli-cyan">projects</span>      - List flagship projects & repositories
  <span class="cli-cyan">contact</span>       - Get direct contact links
  <span class="cli-cyan">clear</span>         - Clear the terminal screen
  <span class="cli-cyan">exit</span>          - Close the CLI window
`,
  whoami: () => `
Operator: <span class="cli-highlight">Rathindra Halder</span>
Role: Network Engineer & Technology Builder
Education: MCA (REVA University, CGPA: 8.65) | B.Sc Maths & CS (Rani Channamma Univ, CGPA: 8.09)
Languages: English, Hindi, Kannada, Bengali
Location: India [IST]
Status: <span class="cli-highlight">OPEN TO OPPORTUNITIES</span>
`,
  skills: () => `
<span class="cli-highlight">PRIMARY (Networking):</span>
  TCP/IP, IPv4/Subnetting, VLANs, Trunking (802.1Q), OSPFv2/v3, ACLs, NAT/PAT, DHCP, DNS, SSH, GRE
<span class="cli-highlight">AUTOMATION:</span>
  Python, Netmiko, Jinja2, YAML, ThreadPoolExecutor
<span class="cli-highlight">DEVELOPMENT:</span>
  Java, Spring Boot, Spring Data JPA, REST APIs, JavaScript
<span class="cli-highlight">AI / SIGNAL:</span>
  TensorFlow, Keras, Librosa, Log-Mel Spectrograms, CNN-BiLSTM
`,
  ping: args => {
    const target = args[0] || "10.0.0.1";
    return `
PING ${target} (56 data bytes):
64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.42 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.98 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=1.05 ms
--- ${target} ping statistics ---
3 packets transmitted, 3 received, <span class="cli-highlight">0% packet loss</span>, rtt min/avg/max = 0.98/1.15/1.42 ms
`;
  },
  traceroute: args => {
    const target = args[0] || "hq-core.ranjit.net";
    return `
traceroute to ${target} (192.168.10.1), 30 hops max:
 1  gw-branch.ranjit.net (192.168.20.1)  0.64 ms
 2  isp-transit-01.ranjit.net (203.0.113.1)  4.12 ms [GRE Tunnel]
 3  hq-edge-gw.ranjit.net (198.51.100.2)  5.80 ms
 4  hq-core.ranjit.net (192.168.10.1)  <span class="cli-highlight">5.94 ms [DESTINATION REACHED]</span>
`;
  },
  "show ip route": () => `
Codes: C - connected, S - static, O - OSPF, IA - OSPF inter area

Gateway of last resort is 203.0.113.1 to network 0.0.0.0

O*E2 0.0.0.0/0 [110/1] via 203.0.113.1, GigabitEthernet0/0/0
C    10.10.10.0/24 is directly connected, GigabitEthernet0/0/1 (MGMT)
C    192.168.10.0/24 is directly connected, Vlan10 (DATA)
C    192.168.20.0/24 is directly connected, Vlan20 (VOICE)
O    192.168.30.0/24 [110/20] via 10.0.0.2, 02:14:38, GigabitEthernet0/0/2 (BRANCH)
`,
  projects: () => `
01. <span class="cli-highlight">Enterprise Hybrid Network Architecture</span>
    <span class="cli-dim">Repo:</span> <span class="cli-cyan">github.com/RathinRH/Enterprise-Hybrid-Network-Architecture</span>
02. <span class="cli-highlight">Network Automation & Provisioning</span>
    <span class="cli-dim">Repo:</span> <span class="cli-cyan">github.com/RathinRH/Network-Automation-and-Provisioning</span>
03. <span class="cli-highlight">AI Resume Screening & Job Matching</span>
    <span class="cli-dim">Repo:</span> <span class="cli-cyan">github.com/RathinRH/AI-Resume-Screening-Job-Matching-System</span>
04. <span class="cli-highlight">Acoustic Heart-Lung Sound Classification</span>
    <span class="cli-dim">Repo:</span> <span class="cli-cyan">github.com/RathinRH/ACOUSTIC-HEART-LUNG-NOISE-CLASSIFICATION-SYSTEM-USING-DEEP-LEARNING</span>
`,
  contact: () => `
Email:    rathindraranjit@gmail.com (Use the copy button on the page)
Phone:    +91 8217675179
GitHub:   https://github.com/RathinRH
LinkedIn: https://www.linkedin.com/in/rathindra-halder-3189372b9
`,
  clear: () => "CLEAR",
  exit: () => { closeCLI(); return ""; }
};

if (cliForm) {
  cliForm.addEventListener("submit", e => {
    e.preventDefault();
    const raw = (cliInput.value || "").trim();
    if (!raw) return;
    cliInput.value = "";

    // Append user input line
    const userLine = document.createElement("div");
    userLine.className = "cli-cmd-line";
    userLine.innerHTML = `<span class="cli-prompt">rathindra@router:~$</span> <span>${raw}</span>`;
    cliOutput.appendChild(userLine);

    const parts = raw.split(" ");
    const cmd = parts[0].toLowerCase();
    const multiCmd = raw.toLowerCase();

    let outputHtml = "";
    if (CLI_COMMANDS[multiCmd]) {
      outputHtml = typeof CLI_COMMANDS[multiCmd] === "function" ? CLI_COMMANDS[multiCmd](parts.slice(1)) : CLI_COMMANDS[multiCmd];
    } else if (CLI_COMMANDS[cmd]) {
      outputHtml = typeof CLI_COMMANDS[cmd] === "function" ? CLI_COMMANDS[cmd](parts.slice(1)) : CLI_COMMANDS[cmd];
    } else {
      outputHtml = `<span class="cli-error">Command not found: ${cmd}</span>. Type '<span class="cli-highlight">help</span>' for available commands.`;
    }

    if (outputHtml === "CLEAR") {
      cliOutput.innerHTML = "";
    } else if (outputHtml) {
      const resp = document.createElement("div");
      resp.className = "cli-response";
      resp.innerHTML = outputHtml;
      cliOutput.appendChild(resp);
    }

    cliOutput.scrollTop = cliOutput.scrollHeight;
  });
}
