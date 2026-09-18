// app/admin/actions.ts
'use server';

import { createClient } from '../utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteProject(formData: FormData) {
  const id = formData.get('id') as string;
  const imageUrl = formData.get('image_url') as string;

  if (!id) {
    throw new Error('معرف المشروع مفقود');
  }

  const supabase = await createClient();

  // 1. فحص المصادقة والتحقق من هوية المستخدم (الأدمن)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('محاولة وصول غير مصرح بها لحذف مشروع:', { id });
    throw new Error('غير مصرح لك بتنفيذ هذه العملية. يرجى تسجيل الدخول أولاً.');
  }

  // 2. جلب المشروع للوصول لجميع صور المعرض المرتبطة به لحذفها
  const { data: project } = await supabase
    .from('projects')
    .select('images_gallery')
    .eq('id', id)
    .single();

  const filesToDelete: string[] = [];

  // إضافة الصورة الرئيسية للحذف
  if (imageUrl) {
    const mainFileName = imageUrl.split('/').pop();
    if (mainFileName) filesToDelete.push(mainFileName);
  }

  // إضافة صور المعرض للحذف
  if (project?.images_gallery && Array.isArray(project.images_gallery)) {
    project.images_gallery.forEach((url: string) => {
      const fileName = url.split('/').pop();
      if (fileName) filesToDelete.push(fileName);
    });
  }

  // حذف الملفات فيزيائياً من Storage
  if (filesToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('projects')
      .remove(filesToDelete);

    if (storageError) {
      console.warn('تحذير: لم يتم حذف بعض الصور من التخزين:', storageError.message);
    }
  }

  // 3. حذف السجل من قاعدة البيانات
  const { error: dbError } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error('خطأ في حذف المشروع من قاعدة البيانات:', dbError);
    throw new Error(`فشل حذف المشروع: ${dbError.message}`);
  }

  // 4. تحديث الكاش للصفحات المتأثرة
  revalidatePath('/admin/projects');
  revalidatePath('/');
  revalidatePath('/portfolio');

  return { success: true };
}