CREATE TRIGGER after_message_insert
AFTER INSERT ON `message`
FOR EACH ROW
BEGIN
    INSERT OR IGNORE INTO `unGroupedMessage` (`messageId`)
    SELECT NEW.`id`;
END;
--> statement-breakpoint

CREATE TRIGGER after_message_update
AFTER UPDATE ON `message`
FOR EACH ROW
BEGIN

    -- Insert into unGroupedMessage if not exists
    INSERT OR IGNORE INTO `unGroupedMessage` (`messageId`)
    SELECT NEW.`id`;
   

    -- Add the conversation to conversationNeedsSummary
    -- We do not need insert into conversationNeedsSummary if the conversation already exists already exists
    INSERT OR IGNORE INTO `conversationNeedsSummary` (`conversationId`)
    SELECT `conversationId` FROM `conversationMessage` WHERE `messageId` = OLD.`id`;

    -- Remove from conversationMessage
    DELETE FROM `conversationMessage` WHERE `messageId` = OLD.`id`;

END;
--> statement-breakpoint
