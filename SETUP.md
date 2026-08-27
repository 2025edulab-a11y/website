# Aurora — 인증 기능 설정 상태

프로젝트: **mywebsite** (`mtnnquvofobsyoqbajmx`, 서울 리전)

## 완료된 것 (자동 적용 + 검증됨)

| # | 항목 | 상태 |
|---|------|------|
| 1 | DB 스키마 — `profiles` 테이블, user/admin 역할, RLS 정책 4개, 함수 4개, 트리거 3개 | ✅ 적용·검증 완료 |
| 2 | 첫 관리자 — `2025edulab@gmail.com` 을 부트스트랩 관리자로 트리거에 내장. **이 이메일로 가입하면 자동 admin** | ✅ 코드에 반영 |
| 3 | Auth URL — Site URL = GitHub Pages 주소, Redirect 허용목록에 Pages·localhost(3000/5173/8080) 등록 | ✅ 적용 완료 |
| — | 이메일 확인 — 테스트 편의를 위해 **자동 확인(mailer_autoconfirm) 켬**. 가입 즉시 로그인됨 | ✅ 적용 완료 |
| — | 가입→프로필 자동 생성 트리거 | ✅ 실제 가입 스모크 테스트 통과 |

> 스키마를 다시 보려면 `supabase/migrations/20260827090000_auth_profiles.sql`.
> 나중에 이메일 확인을 다시 강제하려면 대시보드 Auth → Providers → Email →
> "Confirm email" 을 켜세요.

---

## 남은 것 — Google 로그인 (사용자님 Google 계정 작업 필요)

Google OAuth 클라이언트는 **본인 Google Cloud 계정**에서만 만들 수 있어 대신 못 합니다.
아래 두 값만 만들어 주시면 Supabase 쪽 연결은 바로 넣어 드립니다.

### A. Google Cloud Console (5분)

1. https://console.cloud.google.com/ → 상단에서 프로젝트 생성(또는 선택)
2. **APIs & Services → OAuth consent screen**
   - User Type: **External** → 앱 이름, 지원 이메일 입력 → 저장 (테스트 모드로 두어도 됨)
3. **APIs & Services → Credentials → + Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins**
     - `https://2025edulab-a11y.github.io`
     - `http://localhost:3000`
   - **Authorized redirect URIs** (아래 한 줄, 고정값)
     - `https://mtnnquvofobsyoqbajmx.supabase.co/auth/v1/callback`
   - **Create** → 나오는 **Client ID** 와 **Client secret** 복사

### B. 그다음

복사한 Client ID / Secret 두 개를 저에게 주시면 `external_google_enabled` 를 켜고
값을 넣겠습니다. (또는 직접:
https://supabase.com/dashboard/project/mtnnquvofobsyoqbajmx/auth/providers → Google → Enable)

---

## 로컬에서 실행

`file://` 로 열면 로그인이 안 됩니다. 정적 서버로 여세요.

```powershell
cd E:\Antigravity\mywebsite
npx serve -l 3000
```

→ http://localhost:3000 접속 → 우상단 **로그인** → 회원가입 테스트
(`2025edulab@gmail.com` 으로 가입하면 관리자 페이지도 열립니다)

---

## 페이지

| 파일 | 설명 | 접근 |
|------|------|------|
| `index.html` | 랜딩. 우상단 로그인/이름/로그아웃, 관리자면 "관리자" 링크 | 공개 |
| `signup.html` | 이메일·비밀번호 또는 Google 회원가입 | 공개 |
| `login.html` | 이메일·비밀번호 또는 Google 로그인 | 공개 |
| `mypage.html` | 내 정보·이름 수정·로그아웃 | 로그인 필요 |
| `admin.html` | 전체 회원 목록·권한 변경 | admin 만 |

## 구조 메모

- `app.js` — Supabase 클라이언트(ESM CDN, 빌드 없음) + 인증 헬퍼.
- 접근 통제는 전부 DB의 **RLS 정책**. anon 키 노출돼도 일반 사용자는 자기 행만,
  admin 은 전체 행. 일반 사용자가 자기 `role` 을 바꾸려 하면 트리거가 무시.
- `is_admin()` 은 SECURITY DEFINER 함수라 정책 안에서 재귀 없이 역할을 확인.
