export interface Post {
  Title: string;
  Description?: string;
  Content?: string;
  ImageURL?: string;
  Tags?: string[];
  Categories?: string[];
  Author?: string;
  DateCreated?: string;
  Likes?: number;
  Comments?: number;
  VideoURL?: string;
  UserCaption?: string;
  UserTags?: string[];
  FirebaseUID?: string[];
  VideoTitle?: string;
  UserLikes?: string[];
  LikeCount?: number;
  CommentCount?: number;
} 