CREATE VIRTUAL TABLE user_fts USING fts5(firstName, lastName, email, content="user", content_rowid="internalId");
--> statement-breakpoint


CREATE TRIGGER user_ai AFTER INSERT ON user BEGIN
    INSERT INTO user_fts(rowid, firstName, lastName, email) VALUES (new.internalId, new.firstName, new.lastName, new.email);
END;    
--> statement-breakpoint

CREATE TRIGGER user_ad AFTER DELETE ON user BEGIN
    INSERT INTO user_fts(user_fts, rowid, firstName, lastName, email) VALUES('delete', old.internalId, old.firstName, old.lastName, old.email);
END;
--> statement-breakpoint

CREATE TRIGGER user_au AFTER UPDATE ON user BEGIN
    INSERT INTO user_fts(user_fts, rowid, firstName, lastName, email) VALUES('delete', old.internalId, old.firstName, old.lastName, old.email);
    INSERT INTO user_fts(rowid, firstName, lastName, email) VALUES (new.internalId, new.firstName, new.lastName, new.email);
END;
--> statement-breakpoint


