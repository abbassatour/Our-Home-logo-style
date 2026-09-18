// app/admin/projects/[id]/edit/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaSave,
  FaArrowRight,
  FaCloudUploadAlt,
  FaTrash,
  FaUserTie,
  FaRulerCombined,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    description: "",
    client_name: "",
    area: "",
    completion_date: "",
    status: "completed",
    is_featured: false,
    image_url: "",
    images_gallery: [] as string[],
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("فشل تحميل المشروع، تأكد من صحة الرابط");
        router.push("/admin/projects");
      } else if (data) {
        setFormData({
          title: data.title || "",
          category: data.category || "بناء سكني",
          location: data.location || "",
          description: data.description || "",
          client_name: data.client_name || "",
          area: data.area || "",
          completion_date: data.completion_date || "",
          status: data.status || "completed",
          is_featured: Boolean(data.is_featured),
          image_url: data.image_url || "",
          images_gallery: data.images_gallery || [],
        });
      }
      setLoading(false);
    };

    fetchProject();
  }, [id, supabase, router]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formElement = new FormData(e.currentTarget);

    // 1. جمع وتحديث كافة الحقول (بما فيها الحقول التي كانت مفقودة)
    const updates: any = {
      title: formElement.get("title"),
      category: formElement.get("category"),
      location: formElement.get("location"),
      description: formElement.get("description"),
      client_name: formElement.get("client_name"),
      area: formElement.get("area"),
      completion_date: formElement.get("completion_date") || null,
      status: formElement.get("status"),
      is_featured: formElement.get("is_featured") === "on",
    };

    // 2. معالجة تحديث الصورة الرئيسية وحذف القديمة من التخزين
    const mainImageFile = formElement.get("new_image") as File;
    if (mainImageFile && mainImageFile.size > 0) {
      const fileExt = mainImageFile.name.split(".").pop();
      const fileName = `main_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: upError } = await supabase.storage
        .from("projects")
        .upload(fileName, mainImageFile);

      if (!upError) {
        // تنظيف وحذف الصورة القديمة من Storage لتوفير المساحة
        if (formData.image_url) {
          const oldFileName = formData.image_url.split("/").pop();
          if (oldFileName) {
            await supabase.storage.from("projects").remove([oldFileName]);
          }
        }
        updates.image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects/${fileName}`;
      }
    }

    // 3. معالجة إضافة صور جديدة للمعرض
    const newGalleryFiles = formElement.getAll("new_gallery") as File[];
    const validGalleryFiles = newGalleryFiles.filter((f) => f.size > 0);
    const updatedGallery = [...formData.images_gallery];

    if (validGalleryFiles.length > 0) {
      const uploadPromises = validGalleryFiles.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage
          .from("projects")
          .upload(fileName, file);
        if (!error) {
          return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects/${fileName}`;
        }
        return null;
      });

      const newUrls = await Promise.all(uploadPromises);
      newUrls.forEach((url) => {
        if (url) updatedGallery.push(url);
      });

      updates.images_gallery = updatedGallery;
    }

    // 4. حفظ البيانات في Supabase
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id);

    if (error) {
      alert("حدث خطأ أثناء التحديث");
      console.error(error);
    } else {
      alert("تم تعديل المشروع بنجاح!");
      router.push("/admin/projects");
      router.refresh();
    }
    setSaving(false);
  };

  // حذف صورة معينة من المعرض (قاعدة البيانات + حذف الملف فيزيائياً من Storage)
  const removeGalleryImage = async (imgUrl: string) => {
    if (!confirm("هل تريد حذف هذه الصورة من المعرض؟ سيتم حذفها نهائياً.")) return;

    // حذف الصورة فيزيائياً من التخزين
    const fileName = imgUrl.split("/").pop();
    if (fileName) {
      await supabase.storage.from("projects").remove([fileName]);
    }

    const newGallery = formData.images_gallery.filter((url) => url !== imgUrl);

    const { error } = await supabase
      .from("projects")
      .update({ images_gallery: newGallery })
      .eq("id", id);

    if (!error) {
      setFormData((prev) => ({ ...prev, images_gallery: newGallery }));
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center py-20">جاري تحميل بيانات المشروع...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white transition"
        >
          <FaArrowRight size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          تعديل المشروع: {formData.title}
        </h1>
      </div>

      <form
        onSubmit={handleUpdate}
        className="space-y-8 bg-slate-900 p-6 md:p-8 rounded-2xl border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm text-slate-300">اسم المشروع *</label>
            <input
              name="title"
              defaultValue={formData.title}
              required
              className="w-full bg-slate-950 p-3 rounded-lg border border-white/10 text-white focus:border-yellow-500 outline-none"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-slate-300">الموقع</label>
            <input
              name="location"
              defaultValue={formData.location}
              className="w-full bg-slate-950 p-3 rounded-lg border border-white/10 text-white focus:border-yellow-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-300">التصنيف</label>
          <select
            name="category"
            defaultValue={formData.category}
            className="w-full bg-slate-950 p-3 rounded-lg border border-white/10 text-white focus:border-yellow-500 outline-none"
          >
            <option value="بناء سكني">بناء سكني</option>
            <option value="إكساء داخلي">إكساء داخلي</option>
            <option value="إكساء خارجي">إكساء خارجي</option>
            <option value="تصميم معماري">تصميم معماري</option>
            <option value="تجاري">تجاري</option>
            <option value="ترميم">ترميم</option>
          </select>
        </div>

        {/* الحقول الخمسة المستعادة */}
        <div className="bg-slate-950/50 p-6 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm text-blue-400 flex items-center gap-2">
              <FaUserTie /> اسم العميل
            </label>
            <input
              name="client_name"
              defaultValue={formData.client_name}
              type="text"
              className="w-full bg-slate-900 p-3 rounded-lg border border-white/10 text-white focus:border-blue-500 outline-none"
              placeholder="السيد محمد..."
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-blue-400 flex items-center gap-2">
              <FaRulerCombined /> المساحة
            </label>
            <input
              name="area"
              defaultValue={formData.area}
              type="text"
              className="w-full bg-slate-900 p-3 rounded-lg border border-white/10 text-white focus:border-blue-500 outline-none"
              placeholder="150 م²"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-blue-400 flex items-center gap-2">
              <FaCalendarAlt /> تاريخ التسليم
            </label>
            <input
              name="completion_date"
              defaultValue={formData.completion_date}
              type="date"
              className="w-full bg-slate-900 p-3 rounded-lg border border-white/10 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-300">حالة المشروع</label>
            <select
              name="status"
              defaultValue={formData.status}
              className="w-full bg-slate-900 p-3 rounded-lg border border-white/10 text-white focus:border-blue-500 outline-none"
            >
              <option value="completed">مكتمل (تم التسليم)</option>
              <option value="ongoing">قيد الإنشاء (ورشة قائمة)</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center p-3 bg-slate-900 rounded-lg border border-white/10">
            <input
              type="checkbox"
              name="is_featured"
              id="is_featured"
              defaultChecked={formData.is_featured}
              className="w-5 h-5 accent-yellow-500 cursor-pointer"
            />
            <label
              htmlFor="is_featured"
              className="mr-3 text-white cursor-pointer select-none flex items-center gap-2"
            >
              <FaStar className="text-yellow-500" />
              <span>تثبيت في الصفحة الرئيسية (مشروع مميز)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-300">الوصف التفصيلي</label>
          <textarea
            name="description"
            defaultValue={formData.description}
            className="w-full bg-slate-950 p-3 rounded-lg border border-white/10 text-white h-32 focus:border-yellow-500 outline-none"
          ></textarea>
        </div>

        {/* قسم الصورة الرئيسية واستبدالها */}
        <div className="p-6 border border-white/10 rounded-xl bg-slate-950/30">
          <label className="block mb-4 text-sm text-yellow-500 font-bold">
            الصورة الرئيسية الحالية
          </label>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative w-36 h-24 rounded-lg overflow-hidden border border-white/20 shrink-0">
              <Image
                src={formData.image_url}
                alt="Current Cover"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block mb-2 text-sm text-slate-400">
                استبدال الصورة الرئيسية (اختياري)
              </label>
              <input
                name="new_image"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-slate-400 file:bg-slate-800 file:text-white file:border-0 file:rounded-full file:px-4 file:py-2 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* قسم صور المعرض */}
        <div className="p-6 border border-white/10 rounded-xl bg-slate-950/30">
          <label className="block mb-4 text-sm text-blue-400 font-bold">
            صور المعرض الحالية ({formData.images_gallery.length})
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {formData.images_gallery.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden group border border-white/10"
              >
                <Image src={url} alt="Gallery item" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                  title="حذف الصورة"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4">
            <label className="block mb-2 text-sm text-slate-400 flex items-center gap-2">
              <FaCloudUploadAlt className="text-lg text-blue-400" />
              <span>إضافة صور جديدة للمعرض</span>
            </label>
            <input
              name="new_gallery"
              type="file"
              multiple
              accept="image/*"
              className="block w-full text-sm text-slate-400 file:bg-blue-600/20 file:text-blue-400 file:border-0 file:rounded-full file:px-4 file:py-2 hover:file:bg-blue-600/30 cursor-pointer"
            />
          </div>
        </div>

        <button
          disabled={saving}
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
        >
          {saving ? (
            "جاري الحفظ والتحديث..."
          ) : (
            <>
              <FaSave />
              <span>حفظ جميع التعديلات</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}