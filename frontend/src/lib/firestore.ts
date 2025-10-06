import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  Query,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// 타입 정의
export interface Record {
  id?: string;
  user_id: string;
  category: 'movie' | 'book' | 'place';
  title: string;
  rating: number;
  review: string;
  image_url?: string;
  created_at: Timestamp;
  updated_at: Timestamp;

  // 영화 전용 필드
  director?: string;
  cast?: string[];
  date_watched?: Timestamp;

  // 도서 전용 필드
  author?: string;
  publisher?: string;
  date_started?: Timestamp;
  date_finished?: Timestamp;

  // 장소 전용 필드
  place_name?: string;
  location?: string;
  date_visited?: Timestamp;
}

// 기록 추가
export const addRecord = async (userId: string, recordData: Omit<Record, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  try {
    const docRef = await addDoc(collection(db, 'records'), {
      ...recordData,
      user_id: userId,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// 기록 조회 (단일)
export const getRecord = async (recordId: string) => {
  try {
    const docRef = doc(db, 'records', recordId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } as Record, error: null };
    } else {
      return { data: null, error: 'Document not found' };
    }
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// 기록 조회 (사용자별 전체)
export const getRecordsByUser = async (userId: string, category?: string) => {
  try {
    let q: Query<DocumentData>;

    if (category) {
      q = query(
        collection(db, 'records'),
        where('user_id', '==', userId),
        where('category', '==', category)
      );
    } else {
      q = query(
        collection(db, 'records'),
        where('user_id', '==', userId)
      );
    }

    const querySnapshot = await getDocs(q);
    let records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Record[];

    // Sort by created_at on client side
    records.sort((a, b) => {
      const aTime = a.created_at?.toMillis() || 0;
      const bTime = b.created_at?.toMillis() || 0;
      return bTime - aTime; // descending order
    });

    return { data: records, error: null };
  } catch (error: any) {
    console.error('Firestore error:', error);
    return { data: null, error: error.message };
  }
};

// 기록 수정
export const updateRecord = async (recordId: string, updateData: Partial<Record>) => {
  try {
    const docRef = doc(db, 'records', recordId);
    await updateDoc(docRef, {
      ...updateData,
      updated_at: Timestamp.now()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 기록 삭제
export const deleteRecord = async (recordId: string) => {
  try {
    const docRef = doc(db, 'records', recordId);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
