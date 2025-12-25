export interface Users {
  id?: string; // Firestore doc ID

  account_status: string;

  emailDomain: string;

  roles?: string[];
  user_email: string;

  user_type?: string[];

  created_at?: string;
  last_login?: string;

}