// =====================================================================
// Aurora — Supabase 클라이언트 & 인증 헬퍼 (빌드 도구 없이 ESM CDN 사용)
// =====================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://mtnnquvofobsyoqbajmx.supabase.co";
// anon 키 — 프런트엔드에 노출되어도 안전합니다. 실제 접근 통제는 DB의 RLS 정책이 합니다.
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bm5xdXZvZm9ic3lvcWJham14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTc1NjksImV4cCI6MjEwMzM5MzU2OX0.WP8LRm1TCdtLzR3za3u3jH_nIBh6Ta8VMH888ANOmgM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// ---------- 세션/프로필 ----------------------------------------------
export async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.warn("getProfile:", error.message);
    return null;
  }
  return data;
}

// ---------- 가드 --------------------------------------------------------
// 로그인 안 되어 있으면 login.html 로 보냄. 로그인된 user 를 반환.
export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    const here = location.pathname.split("/").pop() || "index.html";
    location.replace("login.html?next=" + encodeURIComponent(here));
    return null;
  }
  return user;
}

// 관리자만 통과. { user, profile } 반환, 아니면 null.
export async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;
  const profile = await getProfile(user.id);
  if (!profile || profile.role !== "admin") return { user, profile, ok: false };
  return { user, profile, ok: true };
}

// ---------- 로그아웃 -------------------------------------------------
export async function signOut() {
  await supabase.auth.signOut();
  location.href = "index.html";
}

// ---------- 소셜 로그인 ------------------------------------------
// provider: "google" | "kakao"
async function signInWith(provider, label, next) {
  const base = location.href.replace(/[^/]*$/, ""); // 현재 디렉터리 URL
  const redirectTo = base + (next || "mypage.html");
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) alert(label + " 로그인 오류: " + error.message);
}

export const signInWithGoogle = (next) => signInWith("google", "Google", next);
export const signInWithKakao = (next) => signInWith("kakao", "카카오", next);

// ---------- 내비게이션 인증 영역 렌더 -----------------------------
export async function renderNavAuth() {
  const el = document.getElementById("nav-auth");
  if (!el) return;
  const user = await getSessionUser();
  if (!user) {
    el.innerHTML = '<a href="login.html">로그인</a>';
    return;
  }
  const profile = await getProfile(user.id);
  const name = profile?.full_name || user.email;
  let html = `<a href="mypage.html">${escapeHtml(name)}</a>`;
  if (profile?.role === "admin") html += '<a href="admin.html">관리자</a>';
  html += '<a href="#" id="nav-signout">로그아웃</a>';
  el.innerHTML = html;
  document
    .getElementById("nav-signout")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      signOut();
    });
}

export function escapeHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// 로그인/로그아웃 시 내비 자동 갱신
supabase.auth.onAuthStateChange(() => {
  renderNavAuth();
});
