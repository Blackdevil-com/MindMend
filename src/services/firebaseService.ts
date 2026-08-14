import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

/**
 * Firebase Firestore Service for MindMend Academy
 * Dynamic real-time data synchronization with Firebase Cloud Firestore
 */

// 1. Students Collection
export const getStudentsFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'students'));
    const studentsList: any[] = [];
    querySnapshot.forEach((doc) => {
      studentsList.push({ id: doc.id, ...doc.data() });
    });
    return studentsList;
  } catch (error) {
    console.warn('Firebase Firestore load error, using cached fallback:', error);
    return [];
  }
};

export const addStudentToFirebase = async (studentData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'students'), {
      ...studentData,
      created_at: new Date().toISOString(),
    });
    return { id: docRef.id, ...studentData };
  } catch (error) {
    console.error('Error adding student to Firebase:', error);
    throw error;
  }
};

// 2. Courses Collection
export const getCoursesFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'courses'));
    const coursesList: any[] = [];
    querySnapshot.forEach((doc) => {
      coursesList.push({ id: doc.id, ...doc.data() });
    });
    return coursesList;
  } catch (error) {
    console.warn('Firebase Firestore load error:', error);
    return [];
  }
};

export const addCourseToFirebase = async (courseData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      created_at: new Date().toISOString(),
    });
    return { id: docRef.id, ...courseData };
  } catch (error) {
    console.error('Error adding course to Firebase:', error);
    throw error;
  }
};

// 3. Batches Collection
export const getBatchesFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'batches'));
    const batchesList: any[] = [];
    querySnapshot.forEach((doc) => {
      batchesList.push({ id: doc.id, ...doc.data() });
    });
    return batchesList;
  } catch (error) {
    console.warn('Firebase Firestore load error:', error);
    return [];
  }
};

// 4. Online Tests & Assessments
export const getTestsFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tests'));
    const testsList: any[] = [];
    querySnapshot.forEach((doc) => {
      testsList.push({ id: doc.id, ...doc.data() });
    });
    return testsList;
  } catch (error) {
    console.warn('Firebase Firestore load error:', error);
    return [];
  }
};

// 5. Internship Applications
export const getInternshipsFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'internships'));
    const appsList: any[] = [];
    querySnapshot.forEach((doc) => {
      appsList.push({ id: doc.id, ...doc.data() });
    });
    return appsList;
  } catch (error) {
    console.warn('Firebase Firestore load error:', error);
    return [];
  }
};

export const submitInternshipToFirebase = async (appData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'internships'), {
      ...appData,
      applied_at: new Date().toISOString(),
      status: 'under_review',
    });
    return { id: docRef.id, ...appData };
  } catch (error) {
    console.error('Error submitting internship application to Firebase:', error);
    throw error;
  }
};

// 6. Real-time Notifications Listener
export const subscribeToNotifications = (callback: (notifications: any[]) => void) => {
  const q = query(collection(db, 'notifications'), orderBy('created_at', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifs: any[] = [];
    snapshot.forEach((doc) => {
      notifs.push({ id: doc.id, ...doc.data() });
    });
    callback(notifs);
  });
};
