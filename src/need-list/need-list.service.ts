import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { NeedList } from './models/need-list.interface';

import { plainToInstance } from 'class-transformer';
import { convertToRef, sanitizeFirestoreData } from '../common/firestore/firestore.utils';
import { AllNeedListsDto } from './models/all-needlists.dto';

@Injectable()
export class NeedListService {
  private readonly collectionName = 'needlists';

  constructor(
    @Inject('FIRESTORE') private readonly firestore: firestore.Firestore,
  ) {}

  // !!!! This function will throw error for multiple orderBy (Firebase indexes needed)
  // Let's leave this part here, it's a bit tricky
  async findAll(
    sort?: string,
    startAfter?: string,
    limit = 10,
  ): Promise<AllNeedListsDto[]> {
    let query: FirebaseFirestore.Query = this.firestore.collection(
      this.collectionName,
    );

    // 🔹 Parse all sort fields
    if (sort && sort.trim() !== '') {
      const sortFields = sort.split(',').map((s) => {
        const [field, order] = s.split(':');
        const direction: FirebaseFirestore.OrderByDirection = order?.toLowerCase() === 'asc' ? 'asc' : 'desc';
        return { field: field.trim(), direction };
      });

      // 🔹 Apply each orderBy in sequence
      for (const { field, direction } of sortFields) {
        query = query.orderBy(field, direction);
      }

      // 🔹 Handle pagination with startAfter
      // Pagination — use values matching the sort order
      if (startAfter && startAfter.trim() !== '') {
        const cursorValues = startAfter.split(',').map((value) => {
          if (!isNaN(Number(value))) {
            return Number(value);
          }
          const date = new Date(value);
          return !isNaN(date.getTime()) ? date : value;
        });
        query = query.startAfter(...cursorValues);
      }
    } else {
      // Default sort (you can still add more orderBy if you like)
      query = query.orderBy('created_at', 'desc');
    }

    // 🔹 Fetch limited results
    const snapshot = await query.limit(Number(limit)).get();

    if (snapshot.empty) {
      throw new NotFoundException('No needlists found');
    }

    // Use class-transformer to convert and clean data
    const rawDocs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...sanitizeFirestoreData(doc.data()),
    }));
    return plainToInstance(AllNeedListsDto, rawDocs, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string): Promise<AllNeedListsDto> {
    // Instead of using a query, we can use a direct document reference. Much efficient for this case.
    
    // Get the document reference
    const docRef = this.firestore.collection(this.collectionName).doc(id);
    const doc = await docRef.get();

    // Check if the document exists and has data
    if (!doc.exists && !doc.data()) {
      throw new NotFoundException('Need list not found');
    }

    // Convert the document data to the DTO
    return plainToInstance(AllNeedListsDto, {
      id: doc.id,
      ...sanitizeFirestoreData(doc.data()!)
    }, {
      excludeExtraneousValues: true,
    });
  }
}
