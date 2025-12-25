import { Inject, Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';

@Injectable()
export class MembershipService {

      private readonly collectionName = 'roles';
    
      constructor(
        @Inject('FIRESTORE')
        private readonly firestore: firestore.Firestore,
      ) { }
      //
      sanitizeFirestoreData = (obj: any): any => {
        if (!obj) return obj;
    
        // Firestore Timestamp -> ISO string
        if (obj._seconds) {
          return new Date(obj._seconds * 1000 + (obj._nanoseconds || 0) / 1_000_000).toISOString();
        }
    
        // DocumentReference -> path
        if (obj.path) {
          return obj.path;
        }
    
        // Emulator path
        if (obj._path?.segments) {
          return obj._path.segments.join('/');
        }
    
        // Recursive handle for nested objects / arrays
        if (Array.isArray(obj)) {
          return obj.map((v) => this.sanitizeFirestoreData(v));
        }
    
        if (typeof obj === 'object') {
          const out: Record<string, any> = {};
          for (const [k, v] of Object.entries(obj)) {
            out[k] = this.sanitizeFirestoreData(v);
          }
          return out;
        }
    
        return obj;
      };

        async findByOrgId(orgId: string): Promise<any> {
        const docRef = this.firestore.collection(this.collectionName).doc(orgId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return null;
        }
        return this.sanitizeFirestoreData(doc.data());
    }
}
