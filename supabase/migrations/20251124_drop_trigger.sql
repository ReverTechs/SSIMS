-- Drop the trigger and function for automatic profile creation
-- We will handle profile creation manually in the application logic for better control and error handling.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
