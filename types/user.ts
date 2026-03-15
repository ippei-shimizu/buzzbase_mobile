export interface SearchUser {
  id: number;
  name: string;
  user_id: string;
  image: { url: string | null };
  is_private: boolean;
}
