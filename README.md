# Flamingo Test API

웹 기반 디지털 페인팅 소프트웨어 Flamingo의 테스트용 백엔드 API입니다.

## 기능

- 사용자 인증 (로그인, 회원가입, 이메일 인증)
- 사용자 관리 (프로필, 팔로우, 차단)
- 프로젝트 관리 (생성, 수정, 삭제)
- 파일 업로드 (아바타)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일이 이미 설정되어 있습니다. 필요에 따라 수정하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드 및 실행

```bash
npm run build
npm start
```

## API 엔드포인트

### 인증 (`/api/v1/auth`)

- `POST /login` - 로그인
- `POST /register` - 회원가입
- `GET /check-email` - 이메일 중복 확인
- `POST /refresh` - 토큰 갱신
- `POST /forgot-password` - 비밀번호 찾기
- `POST /reset-password` - 비밀번호 재설정
- `POST /verify-email` - 이메일 인증
- `POST /resend-verification` - 인증 이메일 재전송
- `GET /profile` - 프로필 조회 (인증 필요)
- `PUT /profile` - 프로필 수정 (인증 필요)
- `PUT /change-password` - 비밀번호 변경 (인증 필요)
- `DELETE /account` - 계정 삭제 (인증 필요)

### 사용자 (`/api/v1/users`)

- `GET /` - 사용자 목록
- `GET /:userId` - 특정 사용자 조회
- `PUT /:userId` - 사용자 정보 수정 (인증 필요)
- `DELETE /:userId` - 사용자 삭제 (인증 필요)
- `POST /avatar` - 아바타 업로드 (인증 필요)
- `POST /:userId/follow` - 팔로우 (인증 필요)
- `DELETE /:userId/follow` - 언팔로우 (인증 필요)
- `GET /:userId/followers` - 팔로워 목록
- `GET /:userId/following` - 팔로잉 목록
- `POST /:userId/block` - 차단 (인증 필요)
- `DELETE /:userId/block` - 차단 해제 (인증 필요)
- `GET /blocked` - 차단된 사용자 목록 (인증 필요)

### 프로젝트 (`/api/v1/projects`)

- `GET /` - 프로젝트 목록 (인증 필요)
- `GET /:projectId` - 특정 프로젝트 조회 (인증 필요)
- `POST /` - 프로젝트 생성 (인증 필요)
- `PUT /:projectId` - 프로젝트 수정 (인증 필요)
- `DELETE /:projectId` - 프로젝트 삭제 (인증 필요)

## 데이터베이스

PostgreSQL을 사용하며, 서버 시작 시 자동으로 테이블이 생성됩니다.

## 기술 스택

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT 인증
- Bcrypt 암호화
- Multer 파일 업로드
- Joi 데이터 검증
- Nodemailer 이메일 전송

## 프론트엔드 연동

프론트엔드에서 `NEXT_PUBLIC_API_BASE_URL` 환경 변수를 `http://localhost:3001`로 설정하면 됩니다.
