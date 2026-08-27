# Aurora — 인증 기능 설정 가이드

Google 로그인 · 회원가입 · 마이페이지 · 관리자 페이지를 위한 Supabase 설정입니다.
프로젝트: **mywebsite** (`mtnnquvofobsyoqbajmx`, 서울 리전)

코드는 이미 커밋되어 있습니다. 아래 4단계만 하면 동작합니다.

---

## 1. 데이터베이스 스키마 적용

`profiles` 테이블, 역할(role), RLS 정책, 회원가입 트리거를 만듭니다.

### 방법 A — 대시보드 SQL 편집기 (가장 빠름)

1. https://supabase.com/dashboard/project/mtnnquvofobsyoqbajmx/sql/new 열기
2. `supabase/migrations/20260827090000_auth_profiles.sql` 파일 내용 전체를 붙여넣기
3. **Run** 클릭 → "Success" 확인

### 방법 B — CLI (DB 비밀번호 필요)

```powershell
cd E:\Antigravity\mywebsite
supabase init            # 최초 1회, 물어보면 전부 기본값(N/Enter)
supabase link --project-ref mtnnquvofobsyoqbajmx   # DB 비밀번호 입력
supabase db push
```

> DB 비밀번호는 대시보드 → Project Settings → Database → "Database password"
> 에서 확인/재설정할 수 있습니다.

---

## 2. 첫 관리자 지정

먼저 사이트에서 **회원가입을 한 번** 한 뒤(이메일 또는 Google), 아래를 SQL 편집기에서 실행하세요.
`you@example.com` 을 본인 이메일로 바꿉니다.

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

이후로는 `admin.html` 페이지에서 다른 회원의 권한을 UI로 바꿀 수 있습니다.

---

## 3. Auth URL 설정 (리다이렉트 허용 목록)

https://supabase.com/dashboard/project/mtnnquvofobsyoqbajmx/auth/url-configuration

- **Site URL**: 배포 주소. 예) `https://2025edulab-a11y.github.io/website/`
- **Redirect URLs** 에 아래를 추가 (쓰는 것만):
  - `https://2025edulab-a11y.github.io/website/**`
  - `http://localhost:3000/**`
  - `http://127.0.0.1:3000/**`

> `file://` 로 열면 OAuth가 동작하지 않습니다. 로컬 테스트는 3번 아래 "로컬 실행" 참고.

---

## 4. Google 로그인 사용 설정

### 4-1. Google Cloud Console

1. https://console.cloud.google.com/ → 프로젝트 생성(또는 선택)
2. **APIs & Services → OAuth consent screen**
   - User Type: External → 앱 이름/이메일 입력 → 저장
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins**:
     - `https://2025edulab-a11y.github.io`
     - `http://localhost:3000`
   - **Authorized redirect URIs** (Supabase 콜백 주소, 고정):
     - `https://mtnnquvofobsyoqbajmx.supabase.co/auth/v1/callback`
   - 생성 후 **Client ID** 와 **Client Secret** 복사

### 4-2. Supabase 대시보드

https://supabase.com/dashboard/project/mtnnquvofobsyoqbajmx/auth/providers

- **Google** 열기 → Enable → 위의 Client ID / Client Secret 붙여넣기 → Save

끝입니다. `login.html` / `signup.html` 의 "Google로 계속하기" 버튼이 동작합니다.

---

## 로컬 실행

`file://` 대신 정적 서버로 열어야 로그인/OAuth가 됩니다.

```powershell
cd E:\Antigravity\mywebsite
npx serve -l 3000
# → http://localhost:3000
```

---

## 페이지 개요

| 파일 | 설명 | 접근 |
|------|------|------|
| `index.html` | 랜딩. 우상단에 로그인/이름/로그아웃 표시 | 공개 |
| `signup.html` | 이메일·비밀번호 또는 Google 회원가입 | 공개 |
| `login.html` | 이메일·비밀번호 또는 Google 로그인 | 공개 |
| `mypage.html` | 내 정보 확인·이름 수정·로그아웃 | 로그인 필요 |
| `admin.html` | 전체 회원 목록·권한 변경 | `role = 'admin'` 만 |

## 동작 방식 메모

- `app.js` 가 Supabase 클라이언트와 인증 헬퍼를 담당합니다 (ESM CDN, 빌드 없음).
- 회원가입 시 DB 트리거가 `auth.users` → `public.profiles` 행을 자동 생성합니다.
- 권한 통제는 전부 **RLS 정책**으로 합니다. anon 키가 노출되어도
  일반 사용자는 자기 행만, 관리자는 전체 행을 봅니다.
- 일반 사용자가 자기 `role` 을 admin 으로 바꾸려 해도 트리거가 무시합니다.
- 이메일 확인 요구 여부는 대시보드 Auth 설정을 따릅니다. 꺼져 있으면
  가입 즉시 로그인되고, 켜져 있으면 확인 메일 안내가 표시됩니다.
