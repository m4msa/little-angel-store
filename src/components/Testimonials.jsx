import React, { useState } from 'react';
import { Star, User, Plus, X, Send, CheckCircle2, AlertCircle, MessageSquare, ArrowLeft } from 'lucide-react';

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    productId: 1,
    name: 'نورة الشمري',
    city: 'الرياض',
    rating: 5,
    date: 'منذ يومين',
    comment: 'وصلني طقم الاستقبال الملكي والخامة قطن تركي بارد وفائق النعومة، والتطريز بالاسم فخم جداً ومرتب. التوصيل كان سريعاً وتغليف يواجه كهدية فاخرة.',
    product: 'بكج استقبال روز بيبي - تفصيل ملكي فاخر (7 قطع)'
  },
  {
    id: 2,
    productId: 4,
    name: 'أم فيصل',
    city: 'جدة',
    rating: 5,
    date: 'منذ أسبوع',
    comment: 'السرير الهزاز جودته ممتازة ومتين جداً والناموسية تحمي الطفل وسهل الطي والتنقل به بالسفر، تجربة تسوق راقية وخدمة عملاء متعاونة جداً.',
    product: 'سرير أطفال متعدد الارتفاعات مع ناموسية ملكية'
  },
  {
    id: 3,
    productId: 3,
    name: 'سارة القحطاني',
    city: 'الخبر',
    rating: 5,
    date: 'منذ 4 أيام',
    comment: 'المهادات القطنية الموسلين خفيفة ومسامية، وخيوط التطريز الذهبية ثابتة حتى مع الغسيل المتكرر. متجر معتمد لكل مستلزمات طفلي.',
    product: 'مهاد بيبي شتوي ثقيل بطانة صوف تيدي دافئ'
  }
];

export default function Testimonials({
  customReviews = [],
  onAddReview = () => {},
  currentUser = null,
  onOpenProduct = () => {},
  allProducts = []
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(currentUser?.name || '');
  const [reviewerEmail, setReviewerEmail] = useState(currentUser?.email || '');
  const [productName, setProductName] = useState('');
  const [reviewerComment, setReviewerComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const approvedCustom = Array.isArray(customReviews)
    ? customReviews
        .filter(r => r && (r.isVisible || r.status === 'approved'))
        .map(r => ({
          id: r.id,
          productId: r.productId,
          name: r.customerName || 'عميل موثق',
          city: 'مشتري معتمد',
          rating: Number(r.rating) || 5,
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-SA') : 'مؤخراً',
          comment: r.comment,
          product: r.productName || ''
        }))
    : [];

  const reviews = approvedCustom.length >= 2 ? approvedCustom.slice(0, 3) : DEFAULT_TESTIMONIALS;

  // Determine if a review is for the store generally or a specific product
  const isStoreGeneralReview = (rev) => {
    if (!rev) return true;
    const prodName = (rev.product || '').trim();
    if (!prodName) return true;
    const lower = prodName.toLowerCase();
    if (
      lower === 'متجر الملاك الصغير' ||
      lower === 'متجر الملاك' ||
      lower === 'الملاك الصغير' ||
      lower === 'خدمة العملاء' ||
      lower === 'خدمة العملاء والشحن' ||
      lower === 'المتجر'
    ) {
      return true;
    }
    // If no productId and name is generic store
    if (!rev.productId && (lower.includes('متجر') || lower.includes('الملاك'))) {
      return true;
    }
    return false;
  };

  const handleProductClick = (rev) => {
    if (!rev || isStoreGeneralReview(rev)) return;

    let matched = null;
    if (rev.productId) {
      matched = allProducts.find(p => String(p.id) === String(rev.productId));
    }
    if (!matched && rev.product) {
      const q = rev.product.trim().toLowerCase();
      matched = allProducts.find(p => p.name && (p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase())));
    }
    if (!matched && rev.productId) {
      matched = allProducts.find(p => Number(p.id) === Number(rev.productId));
    }

    if (matched && typeof onOpenProduct === 'function') {
      onOpenProduct(matched);
    } else if (allProducts.length > 0 && typeof onOpenProduct === 'function') {
      onOpenProduct(allProducts[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!reviewerName.trim()) {
      setErrorMessage('يرجى كتابة اسمك الكريم');
      return;
    }
    if (!reviewerComment.trim()) {
      setErrorMessage('يرجى كتابة رأيك أو تقييمك للمتجر');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        productId: null,
        productName: productName.trim() || 'متجر الملاك الصغير',
        customerName: reviewerName.trim(),
        customerEmail: reviewerEmail.trim(),
        rating: Number(newRating) || 5,
        comment: reviewerComment.trim(),
        status: 'pending',
        isVisible: false
      };

      if (typeof onAddReview === 'function') {
        await onAddReview(payload);
      }

      setIsSubmitted(true);
      setReviewerComment('');
      setProductName('');
    } catch (err) {
      setErrorMessage('حدث خطأ أثناء إرسال التقييم، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 border-t border-pink-100/60 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            تجارب عملائنا
          </h3>
          <div className="w-16 h-1 bg-brand-600 rounded-full mx-auto" />
          <p className="text-xs sm:text-sm text-slate-600 font-semibold pt-1">
            أكثر من 1500+ أم وعائلة يثقون بجودة وفخامة منتجات الملاك الصغير
          </p>

          {/* Add Review Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setErrorMessage('');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DF7E93] hover:bg-[#d06b82] text-white text-xs font-black shadow-md shadow-pink-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>أضف تقييمك وتجربتك للمتجر ⭐</span>
            </button>
          </div>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((rev) => {
            const isGeneral = isStoreGeneralReview(rev);

            return (
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

                {/* Bottom Bar: ONLY displayed when review is for a specific product */}
                {!isGeneral && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleProductClick(rev)}
                      className="group inline-flex items-center gap-1.5 text-[#8F2338] hover:text-[#b4324d] font-bold transition-all cursor-pointer text-right max-w-full"
                      title={`عرض تفاصيل ${rev.product}`}
                    >
                      <span className="truncate group-hover:underline">{rev.product}</span>
                      <ArrowLeft className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp relative max-h-[90vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#DF7E93] flex items-center justify-center border border-pink-100">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 pt-2">
                شاركنا رأيك وتجربتك في متجر الملاك الصغير
              </h3>
              <p className="text-xs text-slate-500">
                رأيك يهمنا ويسهم في تطوير منتجاتنا وخدمتنا لجميع الأمهات والعائلات
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-emerald-900">
                  شكراً لمشاركتك رأيك وتقييمك! 🎉
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  تم استلام تعليقك بنجاح، شكراً جزيلاً لمشاركتنا تجربتك ورأيك!
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اختر تقييمك (من 1 إلى 5 نجوم):
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-fit">
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const isFilled = (hoverRating || newRating) >= starValue;
                        return (
                          <button
                            key={starValue}
                            type="button"
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setNewRating(starValue)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                            title={`${starValue} نجوم`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300 fill-slate-200'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-extrabold text-amber-600">
                      {hoverRating || newRating} من 5 نجوم ⭐
                    </span>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسمك الكريم *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: أم راكان / سارة العتيبي"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-[#DF7E93] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البريد الإلكتروني أو Gmail
                    </label>
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      value={reviewerEmail}
                      onChange={(e) => setReviewerEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-[#DF7E93] focus:bg-white transition-all dir-ltr text-right"
                    />
                  </div>
                </div>

                {/* Product/Package Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المنتج أو الطلب (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: بكج استقبال ملكي روز / سرير أطفال"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-[#DF7E93] focus:bg-white transition-all"
                  />
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رأيك وتجربتك بالتفصيل *
                  </label>
                  <textarea
                    required
                    rows={3}
                    maxLength={500}
                    placeholder="كيف كانت جودة القماش، التطريز، سرعة التوصيل، والتعامل؟ شاركنا رأيك بكل أمانة..."
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-[#DF7E93] focus:bg-white transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#DF7E93] hover:bg-[#d06b82] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'جارٍ الإرسال...' : 'إرسال التقييم'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </section>
  );
}
