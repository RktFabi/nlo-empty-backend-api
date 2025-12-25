// src/common/firestore/firestore.utils.ts
import * as admin from 'firebase-admin';

type DocumentData = admin.firestore.DocumentData;

/**
 * Recursively sanitizes Firestore document data by:
 * - Converting Timestamps -> ISO strings
 * - Converting DocumentReferences -> paths
 * - Converting emulator _path segments -> paths
 */
export function sanitizeFirestoreData(obj: DocumentData): any {
    if (!obj) return obj;

    // Firestore Timestamp -> ISO
    if (obj._seconds !== undefined) {
        return new Date(
            obj._seconds * 1000 + (obj._nanoseconds ?? 0) / 1_000_000,
        ).toISOString();
    }

    // DocumentReference -> path
    if (typeof obj.path === 'string') {
        return obj.path;
    }

    // Emulator path
    if (obj._path?.segments) {
        return obj._path.segments.join('/');
    }

    // Arrays
    if (Array.isArray(obj)) {
        return obj.map((v) => sanitizeFirestoreData(v));
    }

    // Objects
    if (typeof obj === 'object') {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
            out[k] = sanitizeFirestoreData(v);
        }
        return out;
    }

    return obj;
}
/**
 * Converts a Firestore path string into a DocumentReference.
 */
export function convertToRef(
    firestore: FirebaseFirestore.Firestore,
    path: string | null | undefined,
): FirebaseFirestore.DocumentReference | null {
    return path ? firestore.doc(path) : null;
}
