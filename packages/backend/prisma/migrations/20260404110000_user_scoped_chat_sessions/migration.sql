-- Add user ownership for chat sessions to isolate chats per account
ALTER TABLE "chat_sessions"
ADD COLUMN "user_id" TEXT;

CREATE INDEX "chat_sessions_user_id_updated_at_idx"
ON "chat_sessions"("user_id", "updated_at");

ALTER TABLE "chat_sessions"
ADD CONSTRAINT "chat_sessions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
