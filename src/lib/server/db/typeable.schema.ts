import { pgTable, serial, text, integer, timestamp, jsonb, pgEnum, real, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.schema';

export const exerciseTypeEnum = pgEnum('exercise_type', ['ai', 'user', 'system']);

// 1. Unified Exercise Table
export const exercise = pgTable('exercise', {
  id: serial('id').primaryKey(),
  type: exerciseTypeEnum('type').notNull(),
  content: text('content').notNull(), // The actual text/quotes
  time: integer('time').default(30).notNull(),

  // AI & Personalization specific fields
  isPersonal: boolean('is_personal').default(false).notNull(),
  targetUserId: text('target_user_id').references(() => user.id, { onDelete: 'cascade' }),
  triggerErrors: jsonb('trigger_errors'), // Stores the specific character errors that triggered AI generation

  // Relationships
  authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),

  // Metrics (Cached for performance)
  timesPlayed: integer('times_played').default(0).notNull(),
  avgScore: real('avg_score').default(0).notNull(), // using 'real' for floating point
  likes: integer('likes').default(0).notNull(),
  dislikes: integer('dislikes').default(0).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull()
});


// 2. Exercise Ratings (To track who liked/disliked what)
// This prevents users from spamming likes
export const exerciseRating = pgTable('exercise_rating', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercise.id, { onDelete: 'cascade' }),
  isLiked: integer('is_liked').default(0), // 1 = like, -1 = dislike, 0 = neutral
});

// 3. Updated User Stats
export const userStats = pgTable('user_stats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  xp: integer('xp').default(0).notNull(),
  streak: integer('streak').default(0).notNull(),
  totalTyped: integer('total_typed').default(0).notNull(),
  avgWpm: integer('avg_wpm').default(0).notNull()
});

// 4. Typing Sessions (Now linked to specific exercises)
export const typingSession = pgTable('typing_session', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').references(() => exercise.id, { onDelete: 'cascade' }), // Link to exercise
  wpm: integer('wpm').notNull(),
  accuracy: integer('accuracy').notNull(),
  errors: jsonb('errors'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 5. PvP Matches
export const match = pgTable('match', {
  id: serial('id').primaryKey(),
  player1Id: text('player1_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  player2Id: text('player2_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  winnerId: text('winner_id').references(() => user.id),
  exerciseId: integer('exercise_id').references(() => exercise.id), // The text they raced on
  player1Wpm: integer('player1_wpm'),
  player2Wpm: integer('player2_wpm'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});


// Relations
export const exerciseRelations = relations(exercise, ({ one, many }) => ({
  author: one(user, { fields: [exercise.authorId], references: [user.id] }),
  targetUser: one(user, { fields: [exercise.targetUserId], references: [user.id] }),
  ratings: many(exerciseRating),
  sessions: many(typingSession)
}));

export const exerciseRatingRelations = relations(exerciseRating, ({ one }) => ({
  user: one(user, { fields: [exerciseRating.userId], references: [user.id] }),
  exercise: one(exercise, { fields: [exerciseRating.exerciseId], references: [exercise.id] })
}));

export const typingSessionRelations = relations(typingSession, ({ one }) => ({
  user: one(user, { fields: [typingSession.userId], references: [user.id] }),
  exercise: one(exercise, { fields: [typingSession.exerciseId], references: [exercise.id] })
}));