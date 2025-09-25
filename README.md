# web

## 개발 설정

설치
```sh
npm install -g pnpm@9.11.0
pnpm install
```

서버 실행
```sh
pnpm run build # 코드 수정된 경우에만 필요
pm2 start 4cuts:start:app
```

시작 프로그램 설정
```sh
pm2 startup # 결과로 나오는 명령을 복사해서 수행
pm2 save # 재시작 후에도 현재 실행 프로세스 복구
```

DB 초기화 (`SQLITE_ERROR` 발생 시)
```sh
pnpm run db:generate
pnpm run db:push
```

## Swagger API

https://4cut.us/docs
