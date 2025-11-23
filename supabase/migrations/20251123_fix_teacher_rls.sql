-- Fix RLS policies for teacher_subjects and teacher_classes
-- Allow teachers to manage their own subjects and classes

-- Policy for teacher_subjects
CREATE POLICY "Teachers can insert own subjects" ON public.teacher_subjects
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own subjects" ON public.teacher_subjects
    FOR DELETE TO authenticated
    USING (auth.uid() = teacher_id);

-- Policy for teacher_classes
CREATE POLICY "Teachers can insert own classes" ON public.teacher_classes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON public.teacher_classes
    FOR DELETE TO authenticated
    USING (auth.uid() = teacher_id);
