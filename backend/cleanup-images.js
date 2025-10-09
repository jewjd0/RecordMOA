/**
 * Cloudinary 이미지 삭제 스크립트
 *
 * 사용 방법:
 * 1. npm install cloudinary firebase-admin
 * 2. .env 파일에 Cloudinary 설정 추가
 * 3. Firebase Admin SDK 인증 파일 다운로드
 * 4. node cleanup-images.js
 */

require('dotenv').config();
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const db = admin.firestore();

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 삭제 대기 중인 이미지 삭제
 */
async function cleanupPendingImages() {
  try {
    console.log('🔍 삭제 대기 중인 이미지 조회...');

    const snapshot = await db
      .collection('pending_image_deletions')
      .where('status', '==', 'pending')
      .get();

    if (snapshot.empty) {
      console.log('✅ 삭제 대기 중인 이미지가 없습니다.');
      return;
    }

    console.log(`📋 총 ${snapshot.size}개의 이미지를 삭제합니다.`);

    let successCount = 0;
    let errorCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const { public_id, image_url } = data;

      try {
        // Cloudinary에서 이미지 삭제
        const result = await cloudinary.uploader.destroy(public_id);

        if (result.result === 'ok' || result.result === 'not found') {
          // 삭제 성공 또는 이미지가 이미 없음
          await doc.ref.update({
            status: 'deleted',
            deleted_at: admin.firestore.Timestamp.now(),
          });

          console.log(`✅ 삭제 완료: ${public_id}`);
          successCount++;
        } else {
          // 삭제 실패
          await doc.ref.update({
            status: 'failed',
            error: result.result,
            failed_at: admin.firestore.Timestamp.now(),
          });

          console.error(`❌ 삭제 실패: ${public_id} - ${result.result}`);
          errorCount++;
        }
      } catch (error) {
        // 에러 발생
        await doc.ref.update({
          status: 'failed',
          error: error.message,
          failed_at: admin.firestore.Timestamp.now(),
        });

        console.error(`❌ 에러 발생: ${public_id} - ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 삭제 결과:');
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 실패: ${errorCount}개`);
  } catch (error) {
    console.error('🚨 스크립트 실행 중 오류 발생:', error);
  }
}

/**
 * 오래된 삭제 기록 정리 (30일 이상 지난 항목)
 */
async function cleanupOldRecords() {
  try {
    console.log('\n🧹 오래된 삭제 기록 정리 중...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await db
      .collection('pending_image_deletions')
      .where('status', '==', 'deleted')
      .where('deleted_at', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .get();

    if (snapshot.empty) {
      console.log('✅ 정리할 기록이 없습니다.');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ ${snapshot.size}개의 오래된 기록을 정리했습니다.`);
  } catch (error) {
    console.error('🚨 기록 정리 중 오류 발생:', error);
  }
}

// 스크립트 실행
async function main() {
  console.log('🚀 Cloudinary 이미지 정리 스크립트 시작\n');

  await cleanupPendingImages();
  await cleanupOldRecords();

  console.log('\n✅ 완료!');
  process.exit(0);
}

main();
