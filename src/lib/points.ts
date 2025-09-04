export interface PointsConfig {
  action: string;
  points: number;
  description?: string;
}

export const POINTS_ACTIONS = {
  USER_SIGNUP: "user_signup",
  POST_CREATED: "post_created",
  COMMENT_ADDED: "comment_added",
  PROFILE_COMPLETED: "profile_completed",
  // ... other actions
} as const;

export const POINTS_VALUES: Record<string, number> = {
  [POINTS_ACTIONS.USER_SIGNUP]: 100,
  [POINTS_ACTIONS.POST_CREATED]: 50,
  [POINTS_ACTIONS.COMMENT_ADDED]: 10,
  [POINTS_ACTIONS.PROFILE_COMPLETED]: 25,
};
