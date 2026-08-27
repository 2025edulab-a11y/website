/* Aurora — 인터랙션 (Apple.com 참고) */

// 1) 모바일 메뉴 토글
const burger = document.getElementById("burger");
const drawer = document.getElementById("drawer");

burger.addEventListener("click", () => {
  const open = drawer.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
});

drawer.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    drawer.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  })
);

// 2) 스크롤 시 등장 애니메이션
const revealTargets = document.querySelectorAll(
  ".stage-copy, .stage-visual, .tile, .story"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealTargets.forEach((el) => io.observe(el));

// 3) 나브 바 스크롤 그림자 강화
const nav = document.getElementById("nav");
const onScroll = () => {
  nav.style.boxShadow =
    window.scrollY > 8 ? "0 1px 8px rgba(0,0,0,0.12)" : "none";
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
