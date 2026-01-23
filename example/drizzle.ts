import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const CourseWithIdentity = pgTable("Course", {
	id: int("id"),
	name: text("name"),
                
});

export const SchoolsWithIdentity = pgTable("Schools", {
	id: text("id"),
	userId: text("userId"),
                
	//timestamps
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().default(sql`now()`)
});

export const TrainersWithIdentity = pgTable("Trainers", {
	id: int("id"),
	name: text("name"),
	user: text("user"),
	count: text("count"),
	level: text("level"),
	courseId: int("courseId"),
                
});

export const UsersWithIdentity = pgTable("Users", {
	id: text("id"),
	name: text("name"),
	email: text("email"),
                
});