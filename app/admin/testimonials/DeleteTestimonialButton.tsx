// app/admin/testimonials/DeleteTestimonialButton.tsx
"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import { deleteTestimonial } from "./actions";

interface DeleteTestimonialButtonProps {
  id: string;
}

export default function DeleteTestimonialButton({ id }: DeleteTestimonialButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا الرأي وصورته نهائياً!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      background: "#1e293b",
      color: "#fff",
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        const formData = new FormData();
        formData.append("id", id);

        await deleteTestimonial(formData);

        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف رأي العميل بنجاح.",
          icon: "success",
          background: "#1e293b",
          color: "#fff",
          confirmButtonColor: "#eab308",
        });
      } catch (error) {
        Swal.fire({
          title: "خطأ",
          text: "حدثت مشكلة أثناء محاولة الحذف.",
          icon: "error",
          background: "#1e293b",
          color: "#fff",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-400 p-2 bg-slate-900 rounded-full hover:bg-red-500/10 transition disabled:opacity-50"
      title="حذف الرأي"
    >
      <FaTrash size={14} />
    </button>
  );
}