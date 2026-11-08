# G-AI V1

واجهة محادثة عربية بسيطة. ملفات الواجهة تُنشر على GitHub Pages، وملف `worker.js` يعمل على Cloudflare Workers ليحفظ مفتاح OpenRouter بعيداً عن المتصفح.

## ملفات المشروع
- `index.html` واجهة الصفحة
- `style.css` التصميم المتجاوب
- `script.js` المحادثات المحلية والاتصال بالخادم
- `worker.js` خادم API (يُنشر منفصلاً على Cloudflare Workers)

## قبل الاستخدام
1. انشر ملفات الواجهة على GitHub Pages.
2. انشر `worker.js` على Cloudflare Workers.
3. أضف مفتاح OpenRouter كـ Worker Secret باسم `OPENROUTER_API_KEY`.
4. عدّل `API_URL` في `script.js` إلى رابط Worker الخاص بك متبوعاً بـ `/api/chat`.
5. اختر نموذجاً متاحاً في OpenRouter وعدّل قيمة `MODEL` في `worker.js`.

**مهم:** لا تضع مفتاح API في `script.js` أو أي ملف عام على GitHub. قد يترتب على استخدام API استهلاك مدفوع؛ تحقق من الأسعار والحدود قبل تشغيله.
