CREATE Course IF NOT EXISTS (
	id INT
	name TEXT
            
)

CREATE Schools IF NOT EXISTS (
	id TEXT
	userId TEXT
	CONSTRAINT FK_UsersSchools FOREIGN KEY (id)
	REFERENCES Users(id)
            
	createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE Trainers IF NOT EXISTS (
	id INT
	name TEXT
	user TEXT
	count TEXT
	level TEXT
	courseId INT
	CONSTRAINT FK_CourseTrainers FOREIGN KEY (id)
	REFERENCES Course(id)
            
)

CREATE Users IF NOT EXISTS (
	id TEXT
	name TEXT
	email TEXT
            
)