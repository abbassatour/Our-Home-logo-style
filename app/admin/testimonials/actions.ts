// app/admin/testimonials/actions.ts
'use server';

import { createClient } from '../../utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTestimonial(formData: FormData) {
  try {
    const supabase = await createClient();

    // 1. فحص المصادقة
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { 
        success: false, 
        error: 'غير مصرح لك بإضافة رأي جديد. الجلسة منتهية أو غير صالحة.' 
      };
    }

    const imageFile = formData.get('image') as File;
    let image_url: string | null = null;

    // 2. معالجة ورفع الصورة إن وجدت
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('testimonials')
        .upload(fileName, imageFile, { upsert: false });

      if (uploadError) {
        console.error("❌ UPLOAD ERROR:", uploadError);
        return { success: false, error: `فشل رفع الصورة: ${uploadError.message}` };
      }

      const { data: publicData } = supabase.storage
        .from('testimonials')
        .getPublicUrl(fileName);

      image_url = publicData.publicUrl;
    }

    // 3. قراءة البيانات والتحقق من صحتها
    const client_name = formData.get('client_name') as string;
    const role = formData.get('role') as string;
    const content = formData.get('content') as string;
    const rating = Number(formData.get('rating')) || 5;

    if (!client_name?.trim() || !content?.trim()) {
      return { success: false, error: 'اسم العميل ونص الرأي حقول مطلوبة.' };
    }

    // 4. الإدخال في قاعدة البيانات
    const { error: dbError } = await supabase.from('testimonials').insert({
      client_name: client_name.trim(),
      role: role?.trim() || null,
      content: content.trim(),
      rating,
      image_url,
    });

    if (dbError) {
      console.error("❌ Database Error:", dbError);
      return { success: false, error: `فشل حفظ البيانات: ${dbError.message}` };
    }

    // 5. إعادة تحديث الكاش
    revalidatePath('/admin/testimonials');
    revalidatePath('/');

    return { success: true };
  } catch (err: any) {
    console.error("❌ Action Exception:", err);
    return { success: false, error: err.message || 'حدث خطأ غير متوقع أثناء المعالجة.' };
  }
}

export async function deleteTestimonial(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    throw new Error('معرف الرأي مفقود');
  }

  const supabase = await createClient();

  // 1. فحص المصادقة
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('محاولة غير مصرح بها لحذف رأي عميل:', { id });
    throw new Error('غير مصرح لك بتنفيذ عملية الحذف.');
  }

  // 2. جلب صورة العميل لحذفها من Storage
  const { data: testimonial } = await supabase
    .from('testimonials')
    .select('image_url')
    .eq('id', id)
    .single();

  if (testimonial?.image_url) {
    const fileName = testimonial.image_url.split('/').pop();
    if (fileName) {
      await supabase.storage.from('testimonials').remove([fileName]);
    }
  }

  // 3. الحذف من قاعدة البيانات
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('خطأ أثناء حذف رأي العميل:', error);
    throw new Error(`فشل الحذف: ${error.message}`);
  }

  revalidatePath('/admin/testimonials');
  revalidatePath('/');
  return { success: true };
}