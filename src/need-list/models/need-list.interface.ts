// src/need-list/models/need-list.interface.ts

export interface NeedList {
  id?: string; // Firestore doc ID

  needlist_name: string;
//   needlist_status: 'Draft' | 'Live' | 'Deleted or whatever'; // Example enum values
  needlist_status: string;
  group_id: string[] | null;        // '/groups/abc123'
  org_id: string | null;          // '/organization/xyz456'
  user_id: string | null;         // '/users/xxxxxx'
  location_id: string | null;     // '/locations/xxxxxx'

  total_donated: number;
  total_items: number;
  total_price: number;
  total_tax: number;

  created_at?: string;
  last_updated?: string;
  due_date?: string;
}
