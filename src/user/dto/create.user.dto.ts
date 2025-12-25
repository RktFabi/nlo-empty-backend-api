
import { firestore } from 'firebase-admin';
export class CreateUserDto {
  account_status: string;
  emailDomain: string;
  user_email: string;
  roles: string[];
  user_type: string[];
  created_at: firestore.FieldValue | string;
  last_login?: firestore.FieldValue | string | null;
}
