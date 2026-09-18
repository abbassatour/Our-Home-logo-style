// app/admin/testimonials/page.tsx
import { createClient } from "../../utils/supabase/server";
import { FaStar } from "react-icons/fa";
import AddTestimonialForm from "./AddTestimonialForm";
import DeleteTestimonialButton from "./DeleteTestimonialButton";

export default async function TestimonialsAdmin() {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">إدارة آراء العملاء</h1>

      {/* نموذج إضافة رأي جديد */}
      <AddTestimonialForm />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews?.map((review) => (
          <div
            key={review.id}
            className="bg-slate-800/50 p-6 rounded-xl border border-white/5 relative group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {review.image_url ? (
                  <img
                    src={review.image_url}
                    alt={review.client_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-lg">
                    {review.client_name.charAt(0)}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-white">{review.client_name}</h3>
                  <p className="text-xs text-slate-400">{review.role}</p>
                </div>
              </div>
              <div className="flex text-yellow-500 text-sm">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              &quot;{review.content}&quot;
            </p>

            {/* زر الحذف الآمن مع نافذة التأكيد */}
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition">
              <DeleteTestimonialButton id={review.id} />
            </div>
          </div>
        ))}
        {(!reviews || reviews.length === 0) && (
          <p className="text-slate-500 col-span-2 text-center py-10">
            لا توجد آراء مضافة بعد.
          </p>
        )}
      </div>
    </div>
  );
}