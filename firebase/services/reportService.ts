import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { MatchReport, ReportStatus } from '../types';

const REPORTS_COLLECTION = 'matchReports';

// Create a new match report
export const createMatchReport = async (reportData: {
  matchId: string;
  reportedBy: string;
  reportedByName: string;
  message: string;
}): Promise<string> => {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const now = Timestamp.now();

    const newReport: Omit<MatchReport, 'id'> = {
      ...reportData,
      status: 'pending' as ReportStatus,
      createdAt: now,
    };

    const docRef = await addDoc(reportsRef, newReport);
    return docRef.id;
  } catch (error) {
    console.error('Error creating match report:', error);
    throw error;
  }
};

// Get report by ID
export const getReportById = async (reportId: string): Promise<MatchReport | null> => {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    const reportSnap = await getDoc(reportRef);

    if (reportSnap.exists()) {
      return { id: reportSnap.id, ...reportSnap.data() } as MatchReport;
    }
    return null;
  } catch (error) {
    console.error('Error getting report:', error);
    throw error;
  }
};

// Get all reports (for admin)
export const getAllReports = async (status?: ReportStatus): Promise<MatchReport[]> => {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    let q;

    if (status) {
      q = query(
        reportsRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(reportsRef, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MatchReport));
  } catch (error) {
    console.error('Error getting all reports:', error);
    throw error;
  }
};

// Get reports for a specific match
export const getReportsByMatchId = async (matchId: string): Promise<MatchReport[]> => {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    // Query without orderBy to avoid requiring a composite index
    // We can sort in memory if needed
    const q = query(
      reportsRef,
      where('matchId', '==', matchId)
    );

    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MatchReport));
    
    // Sort by createdAt descending in memory
    return reports.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting reports by match ID:', error);
    throw error;
  }
};

// Get reports by user
export const getReportsByUser = async (userId: string): Promise<MatchReport[]> => {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    // Query without orderBy to avoid requiring a composite index
    // We can sort in memory if needed
    const q = query(
      reportsRef,
      where('reportedBy', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MatchReport));
    
    // Sort by createdAt descending in memory
    return reports.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting reports by user:', error);
    throw error;
  }
};

// Check if a user has already reported a specific match
// This function uses a fallback approach to handle missing indexes
export const hasUserReportedMatch = async (userId: string, matchId: string): Promise<boolean> => {
  try {
    // First, try to get reports by matchId (preferred method)
    try {
      const reports = await getReportsByMatchId(matchId);
      const userReport = reports.find(report => report.reportedBy === userId);
      return !!userReport;
    } catch (matchIdError) {
      // If that fails (e.g., missing index), fall back to querying by user
      const isIndexError = matchIdError instanceof Error && matchIdError.message.includes('requires an index');
      if (isIndexError) {
        try {
          const userReports = await getReportsByUser(userId);
          const userReport = userReports.find(report => report.matchId === matchId);
          return !!userReport;
        } catch (userError) {
          console.error('Error checking user reports (fallback):', userError);
          // If both queries fail, return false to allow reporting (fail open)
          return false;
        }
      }
      // If it's not an index error, rethrow
      throw matchIdError;
    }
  } catch (error) {
    console.error('Error checking if user has reported match:', error);
    // Fail open - if we can't check, allow reporting
    return false;
  }
};

// Resolve a report
export const resolveReport = async (
  reportId: string,
  resolvedBy: string
): Promise<void> => {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, {
      status: 'resolved' as ReportStatus,
      resolvedBy,
      resolvedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error resolving report:', error);
    throw error;
  }
};

// Delete a report (for cleanup after resolution)
export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, {
      // Soft delete by updating status, or use deleteDoc for hard delete
      // For now, we'll use resolveReport to mark as resolved
      // If you want hard delete, use: await deleteDoc(reportRef);
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

