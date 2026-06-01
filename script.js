// ═══════════════════════════════════════════════════
// PRELOADER LOGIC (runs immediately on page load)
// ═══════════════════════════════════════════════════

gsap.registerPlugin(CustomEase);

CustomEase.create("hop", "0.9, 0, 0.1, 1");
CustomEase.create("glide", "0.8, 0, 0.2, 1");

// Also register portfolio eases
CustomEase.create(
  "hopPortfolio",
  "M0,0 C0.355,0.022 0.448,0.079 0.5,0.5 0.542,0.846 0.615,1 1,1"
);
CustomEase.create(
  "hop2Portfolio",
  "M0,0 C0.078,0.617 0.114,0.716 0.255,0.828 0.373,0.922 0.561,1 1,1"
);

let preloaderComplete = false;

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {

  // ── Grab preloader elements ──
  const preloaderEl = document.getElementById("preloader");
  const preloaderBtn = preloaderEl.querySelector(".preloader-btn-container");
  const btnOutlineTrack = preloaderEl.querySelector(".stroke-track");
  const btnOutlineProgress = preloaderEl.querySelector(".stroke-progress");

  // Revealer element (separate from preloader, fixed overlay)
  const preloaderRevealer = document.querySelector(".preloader-revealer");

  const svgPathLength = btnOutlineTrack.getTotalLength();

  gsap.set([btnOutlineTrack, btnOutlineProgress], {
    strokeDasharray: svgPathLength,
    strokeDashoffset: svgPathLength,
  });

  // Split preloader paragraph text using SplitText (loaded via CDN)
  const preloaderTexts = preloaderEl.querySelectorAll("p");
  preloaderTexts.forEach((p) => {
    if (typeof SplitText !== "undefined") {
      new SplitText(p, { type: "lines", linesClass: "line", mask: "lines" });
    }
  });

  // ── Intro animation ──
  const introTl = gsap.timeline({ delay: 0.5 });

  introTl
    .to(preloaderEl.querySelectorAll(".p-row p .line"), {
      y: "0%",
      duration: 0.75,
      ease: "power3.out",
      stagger: 0.1,
    })
    .to(
      btnOutlineTrack,
      { strokeDashoffset: 0, duration: 2, ease: "hop" },
      "<"
    )
    .to(
      preloaderEl.querySelector(".pbc-svg-strokes svg"),
      { rotation: 270, duration: 2, ease: "hop" },
      "<"
    );

  // Progress stops with slight randomness
  const progressStops = [0.2, 0.25, 0.85, 1].map((base, i) => {
    if (i === 3) return 1;
    return base + (Math.random() - 0.5) * 0.1;
  });

  progressStops.forEach((stop, i) => {
    introTl.to(btnOutlineProgress, {
      strokeDashoffset: svgPathLength - svgPathLength * stop,
      duration: 0.75,
      ease: "glide",
      delay: i === 0 ? 0.3 : 0.3 + Math.random() * 0.2,
    });
  });

  introTl
    .to(
      "#pbc-logo",
      { opacity: 0, duration: 0.35, ease: "power1.out" },
      "-=0.25"
    )
    .to("#pbc-label", { opacity: 1, duration: 0.35, ease: "power1.out" })
    .to(
      "#pbc-outro-label",
      { opacity: 1, duration: 0.35, ease: "power1.out" },
      "+=0.8"
    )
    .to(
      preloaderBtn,
      { scale: 0.9, duration: 1.5, ease: "hop" },
      "-=0.5"
    )
    .to(
      preloaderEl.querySelectorAll("#pbc-label .line"),
      {
        y: "0%",
        duration: 0.75,
        ease: "power3.out",
        onComplete: () => {
          preloaderComplete = true;
        },
      },
      "-=0.75"
    );

  // ── Click to engage ──
  preloaderBtn.addEventListener("click", () => {
    if (!preloaderComplete) return;
    preloaderComplete = false;

    const exitTl = gsap.timeline({
      onComplete: () => {
        // Show portfolio after preloader exits
        document.getElementById("main-portfolio").style.display = "block";
        initPortfolio();
      },
    });

    exitTl
      .to(preloaderEl, {
        scale: 0.75,
        duration: 1.25,
        ease: "hop",
      })
      .to(
        [btnOutlineTrack, btnOutlineProgress],
        { strokeDashoffset: -svgPathLength, duration: 1.25, ease: "hop" },
        "<"
      )
      .to(
        preloaderEl.querySelectorAll("#pbc-label .line"),
        { y: "100%", duration: 0.75, ease: "power3.out" },
        "-=1.25"
      )
      .to(
        preloaderEl.querySelectorAll("#pbc-outro-label .line"),
        { y: "0%", duration: 0.75, ease: "power3.out" },
        "-=0.75"
      )
      .to(preloaderEl, {
        clipPath: "polygon(0% 0%, 0% 0, 0% 100%, 0% 100%)",
        duration: 1.5,
        ease: "hop",
      })
      .to(
        preloaderRevealer,
        {
          clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
          duration: 1.5,
          ease: "hop",
          onComplete: () => {
            gsap.set(preloaderEl, { display: "none" });
            document.querySelector(".preloader-backdrop").style.display = "none";
            // Wipe revealer away
            gsap.to(preloaderRevealer, {
              clipPath: "polygon(100% 0%, 100% 0, 100% 100%, 100% 100%)",
              duration: 1,
              ease: "hop",
              delay: 0.1,
              onComplete: () => {
                gsap.set(preloaderRevealer, { display: "none" });
              },
            });
          },
        },
        "-=1.45"
      );
  });
});


// ═══════════════════════════════════════════════════
// PORTFOLIO LOGIC (runs after preloader exits)
// ═══════════════════════════════════════════════════

function initPortfolio() {
  // Register ScrollTrigger & Flip (already loaded via CDN)
  gsap.registerPlugin(ScrollTrigger, Flip);

  // ── Lenis smooth scroll ──
  const lenis = new Lenis({
    smooth: true,
    lerp: 0.1,
    duration: 1.2,
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // ── SplitType for portfolio text ──
  const splitH2 = new SplitType(".site-info h2", { types: "lines" });

  splitH2.lines.forEach((line) => {
    const text = line.textContent;
    const wrapper = document.createElement("div");
    wrapper.className = "line";
    const span = document.createElement("span");
    span.textContent = text;
    wrapper.appendChild(span);
    line.parentNode.replaceChild(wrapper, line);
  });

  const splitAbout = new SplitType(".about-heading", { types: "lines" });

  splitAbout.lines.forEach((line) => {
    const text = line.textContent;
    const wrapper = document.createElement("div");
    wrapper.className = "line";
    const span = document.createElement("span");
    span.textContent = text;
    wrapper.appendChild(span);
    line.parentNode.replaceChild(wrapper, line);
  });

  // About scroll animation
  gsap.to(".about-heading .line span", {
    y: 0,
    duration: 1.5,
    ease: "hop2Portfolio",
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".about",
      start: "top 20%",
      end: "top 30%",
      toggleActions: "play none none none",
    },
  });

  gsap.fromTo(
    ".about-img img",
    { scale: 1.2, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 1.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about",
        start: "top 20%",
        end: "top 30%",
        toggleActions: "play none none none",
      },
    }
  );

  // ── Portfolio hero intro ──
  // const mainTl = gsap.timeline();
  // const revealerTl = gsap.timeline();
  // const scaleTl = gsap.timeline();

  // revealerTl
  //   .to(".r-1", {
  //     clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  //     duration: 1.5,
  //     ease: "hopPortfolio",
  //   })
  //   .to(
  //     ".r-2",
  //     {
  //       clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
  //       duration: 1.5,
  //       ease: "hopPortfolio",
  //     },
  //     "<"
  //   );

  // scaleTl.to(".img:first-child", {
  //   scale: 1,
  //   duration: 2,
  //   ease: "power4.inOut",
  // });

  // const images = document.querySelectorAll(".img:not(:first-child)");
  // images.forEach((img) => {
  //   scaleTl.to(
  //     img,
  //     { opacity: 1, scale: 1, duration: 1.25, ease: "power3.out" },
  //     ">-0.5"
  //   );
  // });

  // mainTl
  //   .add(revealerTl)
  //   .add(scaleTl, "-=1.25")
  //   .add(() => {
  //     document.querySelectorAll(".img:not(.main)").forEach((img) => img.remove());

  //     const state = Flip.getState(".main");

  //     const imagesContainer = document.querySelector(".images");
  //     imagesContainer.classList.add("stacked-container");

  //     document.querySelectorAll(".main").forEach((img, i) => {
  //       img.classList.add("stacked");
  //       img.style.order = i;
  //       gsap.set(".img.stacked", { clearProps: "transform, top, left" });
  //     });

  //     return Flip.from(state, {
  //       duration: 2,
  //       ease: "hopPortfolio",
  //       absolute: true,
  //       stagger: { amount: -0.3 },
  //     });
  //   })
  //   .to(".word h1, .nav-item p, .line p, .site-info h2, .line span", {
  //     y: 0,
  //     duration: 3,
  //     ease: "hop2Portfolio",
  //     stagger: 0.1,
  //     delay: 1.25,
  //   })
  //   .set(".cover-img", {
  //     clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  //   })
  //   .set(".after", { display: "block" })
  //   .set(".revealers", { display: "none", pointerEvents: "none" });
  // ── Hero reveal ──
  if (typeof SplitText !== "undefined") {
    new SplitText(".hero h1", { type: "words", wordClass: "word", mask: "words" });
  }

  gsap.to(".hero", { scale: 1, duration: 1.25, ease: "hop" });
  gsap.to(".hero h1 .word", {
    y: "0%",
    duration: 1,
    ease: "glide",
    stagger: 0.05,
    delay: 0.3,
    onComplete: () => {
      gsap.set(".after", { display: "block" });
      ScrollTrigger.refresh();
    },
  });
  gsap.delayedCall(1.5, () => {
    ScrollTrigger.refresh();
  });

  // ── Skills highlight ──
  const container = document.getElementById("skills-container");
  const highlight = document.getElementById("highlight");
  if (container && highlight) {
    const gridItems = container.querySelectorAll(".grid-item");
    const firstItem = container.querySelector(".grid-item");

    const highlightColors = Array(16).fill("#000");
    gridItems.forEach((item, index) => {
      item.dataset.color = highlightColors[index % highlightColors.length];
    });

    const moveToElement = (element) => {
      if (!element) return;
      gridItems.forEach((i) => i.classList.remove("active"));
      element.classList.add("active");

      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const x = rect.left - containerRect.left;
      const y = rect.top - containerRect.top;

      highlight.style.transform = `translate(${x}px, ${y}px)`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
      highlight.style.backgroundColor = element.dataset.color;
    };

    const moveHighlight = (e) => {
      const hovered = document.elementFromPoint(e.clientX, e.clientY);
      if (!hovered) return;
      if (hovered.classList.contains("grid-item")) {
        moveToElement(hovered);
      } else if (hovered.parentElement?.classList.contains("grid-item")) {
        moveToElement(hovered.parentElement);
      }
    };

    if (firstItem) moveToElement(firstItem);
    container.addEventListener("mousemove", moveHighlight);
  }

  // ── Letter scroll animation ──
  document.querySelectorAll(".roww").forEach((row) => {
    const letters = row.querySelectorAll(".letter");
    gsap.fromTo(
      letters,
      { y: "140%" },
      {
        y: "0%",
        opacity: 1,
        duration: 1.6,
        stagger: { each: 0.06, from: "random" },
        scrollTrigger: {
          trigger: row,
          start: "top 85%",
          end: "top 30%",
          scrub: 1.5,
        },
      }
    );
  });

  // ── Work card video hover ──
  document.querySelectorAll(".work-card").forEach((card) => {
    const video = card.querySelector(".preview-video");
    if (video) {
      card.addEventListener("mouseenter", () => video.play());
      card.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
      });
    }
  });
}