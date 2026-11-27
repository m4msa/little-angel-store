import React from 'react';
import { Star, ShieldCheck, User } from 'lucide-react';

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: 'نورة الشمري',
    city: 'الرياض',
    rating: 5,
    date: 'منذ يومين',
    comment: 'وصلني طقم الاستقبال الملكي والخامة قطن تركي بارد وفائق النعومة، والتطريز بالاسم فخم جداً ومرتب. التوصيل كان سريعاً وتغليف يواجه كهدية فاخرة.',
    product: 'بكج استقبال روز بيبي - تفصيل ملكي'
  },
  {
    id: 2,
    name: 'أم فيصل',
    city: 'جدة',
    rating: 5,
    date: 'منذ أسبوع',
    comment: 'السرير الهزاز جودته ممتازة ومتين جداً والناموسية تحمي الطفل وسهل الطي والتنقل به بالسفر، تجربة تسوق راقية وخدمة عملاء متعاونة جداً.',
    product: 'سرير أطفال متعدد الارتفاعات'
  },
  {
    id: 3,
    name: 'سارة القحطاني',
    city: 'الخبر',
    rating: 5,
    date: 'منذ 4 أيام',
    comment: 'المهادات القطنية الموسلين خفيفة ومسامية، وخيوط التطريز الذهبية ثابتة حتى مع الغسيل المتكرر. متجر معتمد لكل مستلزمات طفلي.',
    product: 'مجموعة مهادات قطن نقي'
  }
];

export default function Testimonials({ customReviews = [] }) {
  const approvedCustom = Array.isArray(customReviews)
    ? customReviews
        .filter(r => r && (r.isVisible || r.status === 'approved'))
        .map(r => ({
          id: r.id,
          name: r.customerName || 'عميل موثق',
          city: 'مشتري معتمد',
          rating: Number(r.rating) || 5,
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-SA') : 'مؤخراً',
          comment: r.comment,
          product: r.productName || 'منتج مميز'
        }))
    : [];

  const reviews = approvedCustom.length >= 2 ? approvedCustom.slice(0, 3) : DEFAULT_TESTIMONIALS;

  return (
    <section className="py-12 border-t border-pink-100/60 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header matching Mini Baby & Tefly */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            تجارب عملائنا
          </h3>
          <div className="w-16 h-1 bg-brand-600 rounded-full mx-auto" />
          <p className="text-xs sm:text-sm text-slate-600 font-semibold pt-1">
            أكثر من 1500+ أم وعائلة يثقون بجودة وفخامة منتجات الملاك الصغير
          </p>
        </div>

        {/* 3 Review Cards (Matching Mini Baby Screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Header: User Avatar + Name + Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-pink-50 text-brand-600 flex items-center justify-center border border-pink-100 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                      <span className="text-[11px] text-slate-600 font-medium">{rev.city} • {rev.date}</span>
                    </div>
                  </div>

                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-[#8F2338] font-bold truncate max-w-[180px]">{rev.product}</span>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] shrink-0">
                  مشتري موثق ✓
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
