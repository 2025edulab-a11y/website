# Aurora — 인증 기능 설정 상태

프로젝트: **mywebsite** (`mtnnquvofobsyoqbajmx`, 서울 리전)

## 완료된 것 (자동 적용 + 검증됨)

| # | 항목 | 상태 |
|---|------|------|
| 1 | DB 스키마 — `profiles` 테이블, user/admin 역할, RLS 정책 4개, 함수 4개, 트리거 3개 | ✅ 적용·검증 완료 |
| 2 | 첫 관리자 — `2025edulab@gmail.com` 을 부트스트랩 관리자로 트리거에 내장. **이 이메일로 가입하면 자동 admin** | ✅ 코드에 반영 |
| 3 | Auth URL — Site URL = GitHub Pages 주소, Redirect 허용목록에 Pages·localhost(3000/5173/8080) 등록 | ✅ 적용 완료 |
| 4 | Google 로그인 — 웹 OAuth 클라이언트 생성, Supabase `external_google_enabled` 켬 | ✅ 적용 완료 |
| 5 | 카카오 로그인 — Kakao 앱 생성, 카카오 로그인·Client Secret 활성화, Supabase `external_kakao_enabled` 켬 | ✅ 적용·테스트 완료 |
| — | 이메일 확인 — 테스트 편의를 위해 **자동 확인(mailer_autoconfirm) 켬**. 가입 즉시 로그인됨 | ✅ 적용 완료 |
| — | 가입→프로필 자동 생성 트리거 | ✅ 실제 가입 스모크 테스트 통과 |

> 스키마를 다시 보려면 `supabase/migrations/20260827090000_auth_profiles.sql`.
> 나중에 이메일 확인을 다시 강제하려면 대시보드 Auth → Providers → Email →
> "Confirm email" 을 켜세요.

---

## Google 로그인 — 설정 완료

Google Cloud 프로젝트 `gen-lang-client-0666038150` 에 웹 OAuth 클라이언트
**"Supabase mywebsite Web"** 을 만들고 Supabase에 연결했습니다.

### Google Cloud Console 설정값

- OAuth consent screen(브랜딩): 앱 이름 `mywebsite`, 지원/개발자 이메일 `2025edulab@gmail.com`,
  승인된 도메인 `2025edulab-a11y.github.io` · `mtnnquvofobsyoqbajmx.supabase.co`
- OAuth 클라이언트 (Web application)
  - Authorized JavaScript origins
    - `https://2025edulab-a11y.github.io`
    - `http://localhost:3000`
  - Authorized redirect URIs
    - `https://mtnnquvofobsyoqbajmx.supabase.co/auth/v1/callback`
  - Client ID: `190347483668-7pua793s07s900sosos0eeh62hovq3t9.apps.googleusercontent.com`
    (Client secret 은 Supabase 에만 저장. 저장소에 커밋하지 않음)
- 게시 상태: **테스트 중**. 테스트 사용자에 `2025edulab@gmail.com` 등록됨.
  다른 계정으로 로그인하려면 대상(Audience) → 테스트 사용자에 추가하거나 "앱 게시" 로 전환.

### Supabase

- `external_google_enabled = true`, `external_google_client_id` / `external_google_secret` 설정됨.
- 대시보드: https://supabase.com/dashboard/project/mtnnquvofobsyoqbajmx/auth/providers → Google

> 이전에 만들었던 **데스크톱** 타입 클라이언트("데스크톱 클라이언트 1")는
> 커스텀 redirect URI 를 지원하지 않아 `redirect_uri_mismatch` 가 났고, 웹 타입으로 교체함.
> 이제 안 쓰이므로 삭제 가능.

---

## 카카오 로그인 — 버튼 숨김 (비즈 앱 전환 대기)

Kakao Developers 앱 **mywebsite** (앱 ID `1559059`) 를 만들고 Supabase에 연결했으나,
아래 KOE205 때문에 로그인이 완료되지 않아 **`login.html` / `signup.html` 의 카카오 버튼을
주석 처리**했습니다. `app.js` 의 `signInWithKakao` 와 Supabase provider 설정은 그대로 두었으므로,
비즈 앱 전환 후 버튼 주석만 풀면 동작합니다.

### Kakao Developers 콘솔 설정값

- 카카오 로그인: **활성화 ON** (OpenID Connect 는 미사용)
- Redirect URI: `https://mtnnquvofobsyoqbajmx.supabase.co/auth/v1/callback`
- 동의항목: 닉네임(`profile_nickname`) = **필수 동의**.
  프로필 사진(`profile_image`) 미설정, 이메일(`account_email`) 은 **권한 없음** (비즈 앱 전환 필요).
- REST API 키 (= Supabase client id): `5599f32b049a7d9135f363dd956700d8`
- 클라이언트 시크릿(카카오 로그인 코드): **활성화 ON**. 값은 Supabase 에만 저장, 저장소에 커밋 안 함.

### Supabase

- `external_kakao_enabled = true`, `external_kakao_client_id` / `external_kakao_secret` 설정됨.
- 대시보드: https://supabase.com/dashboard/project/mtnnquvofobsyoqbajmx/auth/providers → Kakao

### 남은 문제 — KOE205

Supabase gotrue 는 카카오 스코프를 `account_email profile_image profile_nickname` 로 **고정**하며
클라이언트가 넘긴 `scopes` 는 대체가 아니라 **뒤에 덧붙이기만** 한다 (검증: authorize 리다이렉트에
`profile_nickname` 이 중복으로 붙음). 따라서 `account_email` 을 뺄 방법이 없고, 카카오 앱에
`account_email` 권한이 없어 동의 화면에서 **KOE205 (잘못된 요청)** 이 발생한다.

에러 페이지의 "왜 에러가 발생하나요?" 에 명시됨: **"설정하지 않은 동의 항목: account_email"**.
`profile_image` 는 선택 동의로 활성화해서 해결됐고, `account_email` 만 남았다.

**다시 켜는 방법 (본인 카카오 계정 작업):**
1. https://developers.kakao.com/console/app/1559059/config → 앱 아이콘 등록
2. 같은 페이지 비즈니스 → **비즈 앱 전환** (개인 개발자는 본인인증 + 카카오비즈니스 약관 동의)
3. 전환 후 https://developers.kakao.com/console/app/1559059/product/login/scope
   → `account_email` [설정] → **선택 동의**
4. `login.html` / `signup.html` 의 카카오 버튼 `<!-- -->` 주석 해제

> 프로필 자동 생성 트리거는 `raw_user_meta_data` 의 `name` 을 읽으므로, KOE205 해결 후
> 카카오 닉네임이 `profiles.full_name` 에 그대로 채워진다 (DB 변경 없음).

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
