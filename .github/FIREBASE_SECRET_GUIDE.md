# Firebase Service Account Secret 설정 가이드

## ❌ 발생한 문제
```
FIREBASE_SERVICE_ACCOUNT JSON 파싱 실패: Unexpected token in JSON at position 1
```

이 에러는 GitHub Secret에 저장된 JSON 형식이 올바르지 않아서 발생합니다.

---

## ✅ 올바른 설정 방법

### 방법 1: JSON 그대로 복사 (권장)

1. **serviceAccountKey.json 파일 열기**
   ```bash
   notepad backend/serviceAccountKey.json
   ```

2. **전체 내용 복사**
   - `Ctrl + A` → `Ctrl + C`
   - **중요:** 공백, 개행 포함 모든 내용을 그대로 복사

3. **GitHub Secret 설정**
   - https://github.com/jewjd0/RecordMOA/settings/secrets/actions
   - `FIREBASE_SERVICE_ACCOUNT` Secret 클릭 (또는 새로 생성)
   - **Update secret** 클릭
   - 복사한 JSON을 그대로 붙여넣기
   - **Save** 클릭

**예시:**
```json
{
  "type": "service_account",
  "project_id": "recordmoa",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@recordmoa.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://..."
}
```

---

### 방법 2: Base64 인코딩 (대안)

JSON에 특수문자가 많아서 문제가 생긴다면 Base64로 인코딩하세요.

#### Windows (PowerShell)
```powershell
$json = Get-Content backend/serviceAccountKey.json -Raw
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($json))
```

#### Linux/Mac
```bash
cat backend/serviceAccountKey.json | base64
```

출력된 Base64 문자열을 GitHub Secret에 저장하세요.
스크립트가 자동으로 디코딩합니다.

---

## 🔍 문제 해결 체크리스트

### ✅ Secret 값 확인
- [ ] JSON이 `{`로 시작하나요?
- [ ] JSON이 `}`로 끝나나요?
- [ ] 따옴표(`"`)가 올바르게 있나요?
- [ ] 줄바꿈(`\n`)이 `private_key`에 포함되어 있나요?

### ✅ 복사 방법 확인
- [ ] 파일 전체를 복사했나요?
- [ ] 텍스트 편집기(메모장, VSCode)에서 열었나요?
- [ ] Word나 다른 프로그램을 사용하지 않았나요?

### ✅ GitHub Secret 저장
- [ ] 앞뒤 공백 없이 붙여넣었나요?
- [ ] Secret 이름이 정확히 `FIREBASE_SERVICE_ACCOUNT`인가요?
- [ ] **Update** 버튼을 눌렀나요?

---

## 🧪 테스트 방법

1. **Secret 업데이트 후**
   - GitHub → Actions → "Cleanup Cloudinary Images"
   - "Run workflow" 클릭

2. **로그 확인**
   - "Run cleanup script" 단계 클릭
   - 다음 메시지가 보이면 성공:
     ```
     ✅ Firebase 서비스 계정 키 로드 성공
     ```

3. **실패 시 에러 메시지 확인**
   ```
   ❌ FIREBASE_SERVICE_ACCOUNT JSON 파싱 실패: ...
   첫 50자: ...
   마지막 50자: ...
   ```
   이 정보로 문제를 진단할 수 있습니다.

---

## 📝 참고사항

### private_key 필드 주의
`private_key` 필드는 다음과 같은 형식이어야 합니다:

```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...여러줄...\n-----END PRIVATE KEY-----\n"
```

- ✅ `\n`은 줄바꿈 문자입니다 (실제 줄바꿈 아님)
- ✅ 따옴표 안에 모두 포함되어야 합니다
- ❌ 실제 줄바꿈으로 바꾸면 안 됩니다

### JSON 검증 도구
복사한 JSON이 올바른지 확인:
- https://jsonlint.com/
- 붙여넣기 → Validate JSON

---

## ❓ 자주 묻는 질문

### Q: "Unexpected token" 에러가 계속 나요
A: JSON 형식이 깨졌습니다. 파일을 다시 다운로드하거나 Base64 인코딩을 사용하세요.

### Q: Base64를 사용하면 안전한가요?
A: GitHub Secret은 이미 암호화되므로 Base64는 전송 편의를 위한 것입니다.

### Q: Secret을 업데이트했는데 변경이 안 돼요
A: GitHub는 Secret을 즉시 업데이트하지만, 브라우저 캐시 때문일 수 있습니다. 시크릿 창에서 다시 시도하세요.

---

## 🆘 그래도 안 되면?

1. **Firebase Console에서 새 키 생성**
   - https://console.firebase.google.com/project/recordmoa/settings/serviceaccounts/adminsdk
   - "새 비공개 키 생성"
   - 다운로드한 JSON을 다시 복사

2. **로컬에서 테스트**
   ```bash
   cd backend
   npm run cleanup
   ```
   로컬에서 작동하면 JSON 파일은 정상입니다.

3. **GitHub Issue 확인**
   - Actions 탭 → 실패한 워크플로우
   - 로그 전체 복사해서 검토
