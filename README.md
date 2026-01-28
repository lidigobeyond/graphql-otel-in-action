# GraphQL OpenTelemetry in Action

OpenTelemetry SDK를 활용하여 GraphQL 서버의 트레이스(Trace) 정보를 수집하는 실습 프로젝트입니다.   
수집된 트레이스는 Jaeger를 통해 시각화하며, 샘플 데이터로 MySQL employees 데이터베이스를 사용합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | NestJS v11 |
| 언어 | TypeScript v5.7 |
| 런타임 | Node.js v20 |
| GraphQL | Apollo Server v5, @nestjs/graphql |
| 데이터베이스 | MySQL 8 |
| ORM | TypeORM v0.3 |
| 트레이싱 | Jaeger |
| 관측 가능성 | OpenTelemetry SDK |

## 프로젝트 구조

```
graphql-otel-in-action/
├── src/
│   ├── main.ts                    # 애플리케이션 진입점
│   ├── app.module.ts              # 루트 모듈
│   ├── config/                    # 설정 모듈
│   ├── graphql/                   # GraphQL/Apollo 설정
│   ├── typeorm/
│   │   └── entities/              # 데이터베이스 엔티티
│   ├── modules/
│   │   ├── employee/              # 직원 모듈
│   │   ├── department/            # 부서 모듈
│   │   ├── salary/                # 급여 모듈
│   │   └── title/                 # 직책 모듈
│   └── common/                    # 공통 유틸리티
├── instrumentation.ts             # OpenTelemetry 설정
├── docker-compose.yaml            # 로컬 개발 환경
├── Dockerfile                     # Docker 빌드 설정
└── test_db/                       # MySQL 샘플 데이터베이스
```

## 사전 요구사항

- Node.js v20 이상
- npm
- Docker & Docker Compose (로컬 개발용)

## 환경변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `APP_ENV` | 애플리케이션 환경 | `local`, `production` |
| `PORT` | 서버 포트 | `3000` |
| `DATABASE_URL` | MySQL 연결 문자열 | `mysql://user:password@host:3306/employees` |
| `NODE_OPTIONS` | 계측 로드를 위한 Node.js 옵션 | `--import ./dist/instrumentation.js` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry 컬렉터 엔드포인트 | `http://jaeger:4318` |
| `OTEL_NODE_ENABLED_INSTRUMENTATIONS` | 활성화할 OTEL 계측 (선택) | `nestjs-core,graphql,mysql2` |
| `OTEL_TRACES_EXPORTER` | 트레이스 익스포터 타입 (선택) | `otlp` |

### `.env` 파일 예시

```env
APP_ENV=local
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/employees"
NODE_OPTIONS="--import ./dist/instrumentation.js"
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
```

## 시작하기

### 서브모듈 초기화

이 프로젝트는 MySQL 샘플 데이터베이스([test_db](https://github.com/datacharmer/test_db))를 Git 서브모듈로 포함합니다. 프로젝트를 처음 클론한 후 반드시 서브모듈을 초기화해야 합니다:

```bash
git submodule init
git submodule update
```

또는 클론 시 서브모듈을 함께 가져올 수 있습니다:

```bash
git clone --recurse-submodules <repository-url>
```

### Docker Compose 사용 (권장)

모든 의존성과 함께 로컬에서 프로젝트를 실행하는 가장 쉬운 방법입니다:

```bash
# 모든 서비스 시작 (API, MySQL, Jaeger)
docker-compose up

# 또는 백그라운드 모드로 실행
docker-compose up -d
```

실행 후 접속 가능한 주소:
- **API 서버**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **Jaeger UI**: http://localhost:16686
- **MySQL**: localhost:3306

### 수동 설정

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 본인의 환경에 맞게 수정
   ```

3. **프로젝트 빌드**
   ```bash
   npm run build
   ```

4. **개발 서버 시작**
   ```bash
   npm run start:dev
   ```

### 사용 가능한 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm run build` | NestJS 애플리케이션 빌드 |
| `npm run start` | 애플리케이션 시작 |
| `npm run start:dev` | 워치 모드로 시작 (핫 리로드) |
| `npm run start:debug` | 디버그 모드로 시작 |
| `npm run start:prod` | 프로덕션 코드 실행 |
| `npm run lint` | ESLint 실행 |
| `npm run format` | Prettier로 코드 포맷팅 |
| `npm run test` | 단위 테스트 실행 |
| `npm run test:watch` | 워치 모드로 테스트 실행 |
| `npm run test:cov` | 테스트 커버리지 확인 |
| `npm run test:e2e` | E2E 테스트 실행 |

## GraphQL API

### 쿼리

#### 직원 조회

```graphql
# 단일 직원 조회
query {
  employee(id: "10001") {
    id
    firstName
    lastName
    gender
    hireDate
    birthDate
    title
    salary
    departmentId
  }
}

# 직원 목록 조회 (페이지네이션)
query {
  employees(offset: 0, limit: 10) {
    total
    offset
    limit
    items {
      id
      firstName
      lastName
    }
  }
}
```

#### 부서 조회

```graphql
# 단일 부서 조회
query {
  department(id: "d001") {
    id
    name
  }
}

# 부서 목록 조회
query {
  departments(offset: 0, limit: 10) {
    total
    items {
      id
      name
    }
  }
}
```

#### 중첩 쿼리

```graphql
# 직원 정보와 부서 정보, 이력 함께 조회
query {
  employee(id: "10001") {
    id
    firstName
    lastName
    department {
      id
      name
    }
    salaryLogs(fromDateTime: "1990-01-01", toDateTime: "2000-12-31") {
      items {
        salary
        fromDate
        toDate
      }
    }
    titleLogs(fromDateTime: "1990-01-01", toDateTime: "2000-12-31") {
      items {
        title
        fromDate
        toDate
      }
    }
  }
}
```

## 데이터베이스 스키마

MySQL "employees" 샘플 데이터베이스를 사용하며, 다음 엔티티들로 구성됩니다:

| 엔티티 | 설명 |
|--------|------|
| `Employee` | 직원 정보 (id, 이름, 성별, 입사일, 생년월일) |
| `Department` | 부서 정보 (id, 이름) |
| `DeptEmp` | 직원-부서 배치 이력 (기간 포함) |
| `DeptManager` | 부서 관리자 배치 이력 |
| `Salary` | 급여 이력 (기간 포함) |
| `Title` | 직책 이력 (기간 포함) |

## 라이선스

MIT