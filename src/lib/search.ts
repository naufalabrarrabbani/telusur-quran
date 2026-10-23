// Quranic search engine — runs entirely client-side against precomputed indices

// ── Types ──────────────────────────────────────────────────────────────────

export interface Verse {
  surah_no: number
  ayah_no: number
  surah_name_latin: string
  text_uthmani: string
  text_simple: string
  text_normalized: string
  translation_id: string
  juz: number
  page: number
  makkiyah: boolean
}

export interface WordIndex {
  [token: string]: { verse_id: number; position: number }[]
}

export interface SurahMeta {
  number: number
  name_arabic: string
  name_latin: string
  english_name_translation: string
  ayah_count: number
  revelation_type: string
}

export interface SearchResult {
  query: string
  arabicTerm: string
  mode: 'exact' | 'contains' | 'lemma' | 'root'
  totalCount: number
  verseIds: number[]
  breakdown?: { form: string; count: number }[]
}

// ── Harakat stripping ──────────────────────────────────────────────────────

const HARAKAT_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\uFE70-\uFE7F]/g
const TATWEEL_RE = /\u0640/g

export function normalize(text: string): string {
  return text
    .replace(HARAKAT_RE, '')
    .replace(TATWEEL_RE, '')
    .replace(/\uFEFF/g, '')
    .trim()
}

// ── Transliteration map ────────────────────────────────────────────────────

// primary: form used for EXACT search
// contains: form used for CONTAINS substring search
// lemmaRoot: root patterns for ROOT search (paling luas; substring, bisa ikut
//   menangkap kata seakar beda makna)
// lemmaForms: daftar token eksplisit untuk LEMMA search bila pola substring
//   tidak bisa jujur (mis. 'الجن' juga awalan 'الجنة' = surga). Bila ada,
//   mode LEMMA memakai daftar ini; mode ROOT tetap pola lemmaRoot.
interface TranslitEntry {
  primary: string[]    // exact token forms
  contains: string     // substring for CONTAINS mode
  lemmaRoot: string    // patterns for ROOT mode (and LEMMA when no lemmaForms)
  lemmaForms?: string[] // explicit token list for LEMMA mode
}

const TRANSLIT_MAP: Record<string, TranslitEntry> = {
  'setan':    { primary: ['شيطان'], contains: 'شيطان', lemmaRoot: 'شيط|شياطين' },
  'syaitan':  { primary: ['شيطان'], contains: 'شيطان', lemmaRoot: 'شيط|شياطين' },
  'syetan':   { primary: ['شيطان'], contains: 'شيطان', lemmaRoot: 'شيط|شياطين' },
  'sabar':    { primary: ['صبر'], contains: 'صبر', lemmaRoot: 'صبر' },
  'firaun':   { primary: ['فرعون'], contains: 'فرعون', lemmaRoot: 'فرعون' },
  'musa':     { primary: ['موسى'], contains: 'موسى', lemmaRoot: 'موسى' },
  'adam':     { primary: ['آدم'], contains: 'آدم', lemmaRoot: 'آدم' },
  'isa':      { primary: ['عيسى'], contains: 'عيسى', lemmaRoot: 'عيسى' },
  'muhammad': { primary: ['محمد'], contains: 'محمد', lemmaRoot: 'محمد' },
  'nabi':     { primary: ['النبي'], contains: 'النبي', lemmaRoot: 'نبي', lemmaForms: ['النبي', 'النبيين', 'نبيا', 'نبي', 'لنبي', 'الأنبياء', 'والنبيين', 'للنبي', 'النبيون', 'نبيهم', 'أنبياء', 'والنبيون', 'بالنبيين', 'والنبي', 'ونبيا'] },
  'dunia':    { primary: ['الدنيا'], contains: 'الدنيا', lemmaRoot: 'دنيا' },
  'akhirat':  { primary: ['الآخرة'], contains: 'آخر', lemmaRoot: 'آخر' },
  'allah':    { primary: ['الله'], contains: 'الله', lemmaRoot: 'الله' },
  'quran':    { primary: ['القرآن'], contains: 'قرآن', lemmaRoot: 'قرآن' },
  'malaikat': { primary: ['الملائكة'], contains: 'ملائك', lemmaRoot: 'ملائك' },
  'surga':    { primary: ['الجنة'], contains: 'جنة', lemmaRoot: 'جنة|جنات', lemmaForms: ['جنات', 'الجنة', 'جنة', 'وجنات', 'وجنة', 'بالجنة', 'الجنات'] },
  'neraka':   { primary: ['النار'], contains: 'نار', lemmaRoot: 'نار', lemmaForms: ['النار', 'نار', 'نارا', 'فالنار', 'والنار'] },
  'ibrahim':  { primary: ['إبراهيم'], contains: 'براهيم', lemmaRoot: 'براهيم' },
  'yusuf':    { primary: ['يوسف'], contains: 'يوسف', lemmaRoot: 'يوسف' },
  'nuh':      { primary: ['نوح'], contains: 'نوح', lemmaRoot: 'نوح', lemmaForms: ['نوح', 'نوحا', 'ونوحا'] },
  'maryam':   { primary: ['مريم'], contains: 'مريم', lemmaRoot: 'مريم' },
  'hari':     { primary: ['يوم'], contains: 'يوم', lemmaRoot: 'يوم' },
  // ── Perluasan kamus (22 Okt 2026) — setiap entri terverifikasi ke word-index;
  //    bentuk yang tidak muncul di teks tidak dimasukkan.
  'yunus':    { primary: ['يونس'], contains: 'يونس', lemmaRoot: 'يونس' },
  'ayyub':    { primary: ['أيوب'], contains: 'أيوب', lemmaRoot: 'أيوب' },
  'yaqub':    { primary: ['يعقوب'], contains: 'يعقوب', lemmaRoot: 'يعقوب' },
  'ishaq':    { primary: ['إسحاق'], contains: 'سحاق', lemmaRoot: 'سحاق' },
  'ismail':   { primary: ['إسماعيل'], contains: 'سماعيل', lemmaRoot: 'سماعيل' },
  'dawud':    { primary: ['داوود'], contains: 'داوود', lemmaRoot: 'داوود' },
  'sulaiman': { primary: ['سليمان'], contains: 'سليمان', lemmaRoot: 'سليمان' },
  'harun':    { primary: ['هارون'], contains: 'هارون', lemmaRoot: 'هارون' },
  'zakariya': { primary: ['زكريا'], contains: 'زكريا', lemmaRoot: 'زكريا' },
  'yahya':    { primary: ['يحيى'], contains: 'يحيى', lemmaRoot: 'يحيى' },
  'luth':     { primary: ['لوط'], contains: 'لوط', lemmaRoot: 'لوط' },
  'hud':      { primary: ['هود'], contains: 'هودا', lemmaRoot: 'هود', lemmaForms: ['هود', 'هودا'] },
  'shalih':   { primary: ['صالح'], contains: 'صالح', lemmaRoot: 'صالح' },
  'saleh':    { primary: ['صالح'], contains: 'صالح', lemmaRoot: 'صالح' },
  'syuaib':   { primary: ['شعيب'], contains: 'شعيب', lemmaRoot: 'شعيب' },
  'idris':    { primary: ['إدريس'], contains: 'دريس', lemmaRoot: 'دريس' },
  'ilyas':    { primary: ['إلياس'], contains: 'لياس', lemmaRoot: 'لياس' },
  'thalut':   { primary: ['طالوت'], contains: 'طالوت', lemmaRoot: 'طالوت' },
  'jalut':    { primary: ['جالوت'], contains: 'جالوت', lemmaRoot: 'جالوت' },
  'qarun':    { primary: ['قارون'], contains: 'قارون', lemmaRoot: 'قارون' },
  'haman':    { primary: ['هامان'], contains: 'هامان', lemmaRoot: 'هامان' },
  'samiri':   { primary: ['السامري'], contains: 'سامري', lemmaRoot: 'سامري' },
  'luqman':   { primary: ['لقمان'], contains: 'لقمان', lemmaRoot: 'لقمان' },
  'dzulkarnain': { primary: ['القرنين'], contains: 'القرنين', lemmaRoot: 'القرنين' },
  'imran':    { primary: ['عمران'], contains: 'عمران', lemmaRoot: 'عمران' },
  'jibril':   { primary: ['وجبريل', 'لجبريل'], contains: 'جبر', lemmaRoot: 'جبر' },
  'mikail':   { primary: ['وميكال'], contains: 'ميكا', lemmaRoot: 'ميكا' },
  'iblis':    { primary: ['إبليس'], contains: 'بليس', lemmaRoot: 'بليس' },
  'jin':      { primary: ['الجن'], contains: 'الجن', lemmaRoot: 'الجن|الجان', lemmaForms: ['الجن', 'جان', 'والجن', 'جن', 'والجان', 'الجان'] },
  'shalat':   { primary: ['الصلاة'], contains: 'صلاة', lemmaRoot: 'صلاة|صلات' },
  'sholat':   { primary: ['الصلاة'], contains: 'صلاة', lemmaRoot: 'صلاة|صلات' },
  'solat':    { primary: ['الصلاة'], contains: 'صلاة', lemmaRoot: 'صلاة|صلات' },
  'zakat':    { primary: ['الزكاة'], contains: 'زكاة', lemmaRoot: 'زكا' },
  'puasa':    { primary: ['الصيام'], contains: 'صيام', lemmaRoot: 'صيام|صوم' },
  'haji':     { primary: ['الحج'], contains: 'الحج', lemmaRoot: 'الحج|حج', lemmaForms: ['الحج', 'حج', 'بالحج', 'والحج'] },
  'umrah':    { primary: ['والعمرة', 'بالعمرة'], contains: 'عمرة', lemmaRoot: 'عمرة' },
  'doa':      { primary: ['الدعاء'], contains: 'دعاء', lemmaRoot: 'دعا' },
  'dzikir':   { primary: ['الذكر'], contains: 'ذكر', lemmaRoot: 'ذكر' },
  'zikir':    { primary: ['الذكر'], contains: 'ذكر', lemmaRoot: 'ذكر' },
  'shalawat': { primary: ['صلوات'], contains: 'صلوات', lemmaRoot: 'صلوات' },
  'sujud':    { primary: ['السجود'], contains: 'سجد', lemmaRoot: 'سجد' },
  'kurban':   { primary: ['قربانا', 'بقربان'], contains: 'قربان', lemmaRoot: 'قربان' },
  'qurban':   { primary: ['قربانا', 'بقربان'], contains: 'قربان', lemmaRoot: 'قربان' },
  'iman':     { primary: ['الإيمان'], contains: 'إيمان', lemmaRoot: 'إيمان' },
  'islam':    { primary: ['الإسلام'], contains: 'إسلام', lemmaRoot: 'إسلام' },
  'muslim':   { primary: ['المسلمين'], contains: 'مسلم', lemmaRoot: 'مسلم' },
  'takwa':    { primary: ['التقوى'], contains: 'تقوى', lemmaRoot: 'تقوى|المتقين' },
  'taqwa':    { primary: ['التقوى'], contains: 'تقوى', lemmaRoot: 'تقوى|المتقين' },
  'syukur':   { primary: ['شكر'], contains: 'شكر', lemmaRoot: 'شكر' },
  'taubat':   { primary: ['التوبة'], contains: 'توبة', lemmaRoot: 'توب' },
  'kafir':    { primary: ['الكفار'], contains: 'كفر', lemmaRoot: 'كفر' },
  'munafik':  { primary: ['المنافقون'], contains: 'نافق', lemmaRoot: 'نافق' },
  'syirik':   { primary: ['المشركون'], contains: 'شرك', lemmaRoot: 'شرك' },
  'musyrik':  { primary: ['المشركون'], contains: 'شرك', lemmaRoot: 'شرك' },
  'fitnah':   { primary: ['الفتنة'], contains: 'فتنة', lemmaRoot: 'فتن' },
  'ghaib':    { primary: ['الغيب'], contains: 'غيب', lemmaRoot: 'غيب' },
  'wahyu':    { primary: ['وحي'], contains: 'وحي', lemmaRoot: 'وحي', lemmaForms: ['أوحينا', 'أوحي', 'وأوحينا', 'نوحي', 'يوحي', 'وأوحي', 'ووحينا', 'نوحيه', 'فأوحينا', 'فيوحي', 'بالوحي', 'أوحيت', 'وحيه', 'وحيا', 'نوحيها', 'وحي'] },
  'rasul':    { primary: ['الرسول'], contains: 'رسول', lemmaRoot: 'رسول|رسل' },
  'hidayah':  { primary: ['الهدى'], contains: 'هدى', lemmaRoot: 'هدى' },
  'rahmat':   { primary: ['الرحمة'], contains: 'رحمة', lemmaRoot: 'رحمة' },
  'rezeki':   { primary: ['الرزق'], contains: 'رزق', lemmaRoot: 'رزق' },
  'rizki':    { primary: ['الرزق'], contains: 'رزق', lemmaRoot: 'رزق' },
  'jihad':    { primary: ['جهادا'], contains: 'جهاد', lemmaRoot: 'جهاد|جاهد' },
  'hijrah':   { primary: ['هاجر'], contains: 'هاجر', lemmaRoot: 'هاجر' },
  'azab':     { primary: ['العذاب'], contains: 'عذاب', lemmaRoot: 'عذاب' },
  'syafaat':  { primary: ['الشفاعة'], contains: 'شفاعة', lemmaRoot: 'شفاع' },
  'taurat':   { primary: ['التوراة'], contains: 'توراة', lemmaRoot: 'توراة' },
  'injil':    { primary: ['الإنجيل'], contains: 'نجيل', lemmaRoot: 'نجيل' },
  'zabur':    { primary: ['الزبور'], contains: 'زبور', lemmaRoot: 'زبور' },
  'makkah':   { primary: ['مكة'], contains: 'مكة', lemmaRoot: 'مكة' },
  'mekah':    { primary: ['مكة'], contains: 'مكة', lemmaRoot: 'مكة' },
  'bakkah':   { primary: ['ببكة'], contains: 'بكة', lemmaRoot: 'بكة' },
  'madinah':  { primary: ['المدينة'], contains: 'مدينة', lemmaRoot: 'مدينة' },
  'kaabah':   { primary: ['الكعبة'], contains: 'كعبة', lemmaRoot: 'كعبة' },
  'kabah':    { primary: ['الكعبة'], contains: 'كعبة', lemmaRoot: 'كعبة' },
  'masjid':   { primary: ['المسجد'], contains: 'مسجد', lemmaRoot: 'مسجد|مساجد' },
  'kiamat':   { primary: ['القيامة'], contains: 'قيامة', lemmaRoot: 'قيامة' },
  'barzakh':  { primary: ['برزخ'], contains: 'برزخ', lemmaRoot: 'برزخ' },
  'hisab':    { primary: ['الحساب'], contains: 'حساب', lemmaRoot: 'حساب' },
  'mizan':    { primary: ['الميزان'], contains: 'ميزان', lemmaRoot: 'ميزان|موازين' },
  'timbangan': { primary: ['الميزان'], contains: 'ميزان', lemmaRoot: 'ميزان|موازين' },
  'shirath':  { primary: ['الصراط'], contains: 'صراط', lemmaRoot: 'صراط' },
  'sirath':   { primary: ['الصراط'], contains: 'صراط', lemmaRoot: 'صراط' },
  'jahanam':  { primary: ['جهنم'], contains: 'جهنم', lemmaRoot: 'جهنم' },
  'jahannam': { primary: ['جهنم'], contains: 'جهنم', lemmaRoot: 'جهنم' },
  'firdaus':  { primary: ['الفردوس'], contains: 'فردوس', lemmaRoot: 'فردوس' },
  'bulan':    { primary: ['الشهر'], contains: 'شهر', lemmaRoot: 'شهر' },
  'qamar':    { primary: ['القمر'], contains: 'قمر', lemmaRoot: 'قمر' },
  'ramadhan': { primary: ['رمضان'], contains: 'رمضان', lemmaRoot: 'رمضان' },
  'ramadan':  { primary: ['رمضان'], contains: 'رمضان', lemmaRoot: 'رمضان' },
  'qadar':    { primary: ['القدر'], contains: 'قدر', lemmaRoot: 'قدر' },
  'ad':       { primary: ['عاد'], contains: 'عاد', lemmaRoot: 'عاد', lemmaForms: ['عاد', 'وعاد', 'عادا', 'وعادا', 'لعاد', 'بعاد'] },
  'tsamud':   { primary: ['ثمود'], contains: 'ثمود', lemmaRoot: 'ثمود' },
  'israil':   { primary: ['إسرائيل'], contains: 'سرائيل', lemmaRoot: 'سرائيل' },
  'yajuj':    { primary: ['يأجوج'], contains: 'أجوج', lemmaRoot: 'أجوج' },
  // Keluarga muamalah & dosa besar (ditambahkan 22 Okt — sempat terlewat)
  'riba':     { primary: ['الربا'], contains: 'الربا', lemmaRoot: 'ربا', lemmaForms: ['الربا', 'ربا'] },
  'zina':     { primary: ['الزنا', 'الزاني', 'الزانية'], contains: 'الزان', lemmaRoot: 'الزنا|الزان|يزن|زانية', lemmaForms: ['الزاني', 'والزانية', 'الزنا', 'زانية', 'يزنين', 'يزنون', 'الزانية', 'والزاني', 'زان'] },
  'khamr':    { primary: ['الخمر'], contains: 'خمر', lemmaRoot: 'خمر', lemmaForms: ['الخمر', 'خمرا', 'خمر'] },
  'miras':    { primary: ['الخمر'], contains: 'خمر', lemmaRoot: 'خمر', lemmaForms: ['الخمر', 'خمرا', 'خمر'] },
  'maisir':   { primary: ['والميسر'], contains: 'ميسر', lemmaRoot: 'ميسر' },
  'judi':     { primary: ['والميسر'], contains: 'ميسر', lemmaRoot: 'ميسر' },
  'sihir':    { primary: ['السحر'], contains: 'سحر', lemmaRoot: 'سحر' },
  'dosa':     { primary: ['الذنب'], contains: 'ذنب', lemmaRoot: 'ذنب|إثم' },
  'amanah':   { primary: ['الأمانة'], contains: 'أمانات', lemmaRoot: 'أمانة|أمانات|أمانت' },
  // الإخلاص sebagai masdar tidak pernah muncul telanjang (0x) — yang ada bentuk-bentuk mukhlis/mukhlas
  'ikhlas':   { primary: ['المخلصين', 'مخلصين', 'مخلصا'], contains: 'خلص', lemmaRoot: 'خلص' },
  // Klaster cahaya & waktu (ditambahkan 22 Okt — audit per bentuk token;
  // LEMMA dalam ayat unik: cahaya 33, malam 81, siang 50, gelap 21,
  // matahari 32, fajar 5. Jebakan yang disingkirkan dari LEMMA: التنور
  // "oven" & نورث "Kami wariskan" dari cahaya; قليل "sedikit" (71 kemunculan)
  // & خليل dari malam; أنهار "sungai-sungai" (51) dari siang; akar فجر
  // bermakna "memancar" (air) & الفجرة "para pendurhaka" dari fajar)
  'cahaya':   { primary: ['النور'], contains: 'نور', lemmaRoot: 'نور', lemmaForms: ['النور', 'نورا', 'نور', 'والنور', 'نوره', 'ونور', 'نورهم', 'بنورهم', 'لنوره', 'بنور', 'نوركم', 'ونورهم', 'نورنا'] },
  'nur':      { primary: ['النور'], contains: 'نور', lemmaRoot: 'نور', lemmaForms: ['النور', 'نورا', 'نور', 'والنور', 'نوره', 'ونور', 'نورهم', 'بنورهم', 'لنوره', 'بنور', 'نوركم', 'ونورهم', 'نورنا'] },
  'malam':    { primary: ['الليل'], contains: 'ليل', lemmaRoot: 'ليل|ليال', lemmaForms: ['الليل', 'ليلة', 'والليل', 'بالليل', 'ليلا', 'ليال', 'ليالي', 'وليال', 'بليل', 'وبالليل', 'ليلها'] },
  'siang':    { primary: ['النهار'], contains: 'نهار', lemmaRoot: 'نهار', lemmaForms: ['والنهار', 'النهار', 'بالنهار', 'نهارا', 'نهار', 'ونهارا'] },
  'gelap':    { primary: ['الظلمات'], contains: 'ظلمات', lemmaRoot: 'ظلمات', lemmaForms: ['الظلمات', 'ظلمات', 'كظلمات'] },
  'kegelapan': { primary: ['الظلمات'], contains: 'ظلمات', lemmaRoot: 'ظلمات', lemmaForms: ['الظلمات', 'ظلمات', 'كظلمات'] },
  'matahari': { primary: ['الشمس'], contains: 'شمس', lemmaRoot: 'شمس', lemmaForms: ['الشمس', 'والشمس', 'للشمس', 'بالشمس', 'شمسا'] },
  'fajar':    { primary: ['الفجر'], contains: 'فجر', lemmaRoot: 'فجر', lemmaForms: ['الفجر', 'والفجر'] },
  // ── Perluasan kamus batch 23 Okt 2026 — 67 entri baru.
  //    Setiap form terverifikasi hadir di word-index.json (lihat
  //    scripts di sesi ini). lemmaForms = token eksplisit untuk mode LEMMA
  //    agar substring yang berpotensi tabrakan dengan kata lain (mis. مال,
  //    من, آدم, الأرض) tidak ikut tertangkap. Mode CONTAINS tetap pakai
  //    substring 'contains'.
  'sedekah': { primary: ['الصدقات', 'صدقة'], contains: 'صدق', lemmaRoot: 'صدق', lemmaForms: ['الصدقات', 'صدقة', 'بصدقة', 'صدقاتكم'] },
  'shadaqah': { primary: ['الصدقات', 'صدقة'], contains: 'صدق', lemmaRoot: 'صدق', lemmaForms: ['الصدقات', 'صدقة', 'بصدقة', 'صدقاتكم'] },
  'infaq': { primary: ['ينفقون', 'أنفقوا'], contains: 'نفق', lemmaRoot: 'نفق', lemmaForms: ['ينفقون', 'أنفقوا', 'وأنفقوا', 'تنفقوا', 'ينفق', 'أنفقتم', 'تنفقون', 'نفقة', 'أنفق', 'فأنفقوا', 'فلينفق', 'وينفقوا', 'لينفق'] },
  'nafkah': { primary: ['نفقة', 'ينفقون'], contains: 'نفق', lemmaRoot: 'نفق', lemmaForms: ['نفقة', 'ينفقون', 'أنفقوا', 'وأنفقوا', 'تنفقوا', 'ينفق', 'فأنفقوا', 'فلينفق'] },
  'zalim': { primary: ['الظالمين', 'ظلموا'], contains: 'ظلم', lemmaRoot: 'ظلم', lemmaForms: ['ظلموا', 'يظلمون', 'أظلم', 'الظالمين', 'الظالمون', 'ظلما', 'ظلم', 'تظلمون', 'يظلم', 'بظلم', 'ظلمهم', 'ليظلمهم', 'ظالم', 'ظالمي', 'ظالمين'] },
  'adil': { primary: ['بالعدل', 'عدل'], contains: 'عدل', lemmaRoot: 'عدل', lemmaForms: ['عدل', 'بالعدل', 'يعدلون', 'تعدلوا', 'تعدل', 'وعدلا'] },
  'ihsan': { primary: ['الإحسان', 'المحسنين'], contains: 'حسن', lemmaRoot: 'حسن', lemmaForms: ['أحسن', 'أحسنوا', 'المحسنين', 'الإحسان', 'إحسانا', 'وأحسن', 'أحسنتم', 'وأحسنوا'] },
  'khusyuk': { primary: ['الخاشعين', 'خاشعين'], contains: 'خشع', lemmaRoot: 'خشع', lemmaForms: ['خاشعين', 'الخاشعين', 'خاشعة', 'خاشعا', 'تخشع', 'خشعا', 'وخشعت'] },
  'tawakal': { primary: ['توكلت', 'المتوكلين'], contains: 'توكل', lemmaRoot: 'وكل', lemmaForms: ['توكلت', 'فتوكل', 'وتوكل', 'يتوكل', 'توكلوا', 'يتوكلون', 'المتوكلين'] },
  'fitrah': { primary: ['فطرت'], contains: 'فطر', lemmaRoot: 'فطر', lemmaForms: ['فطر', 'فطرت', 'فاطر'] },
  'barakah': { primary: ['مباركا'], contains: 'بارك', lemmaRoot: 'برك', lemmaForms: ['وبارك', 'مباركا', 'المباركة', 'مباركة', 'وباركنا', 'باركنا', 'تبارك', 'مبارك'] },
  'ibu': { primary: ['أمه'], contains: 'أمه', lemmaRoot: 'أم', lemmaForms: ['أمه', 'أمك', 'أمهاتكم', 'أمهاتهم', 'وأمه'] },
  'ayah': { primary: ['لأبيه'], contains: 'أبي', lemmaRoot: 'أب', lemmaForms: ['لأبيه', 'أبانا', 'أبت', 'وأبيه', 'أباكم', 'أبيكم', 'أبوهم', 'وآباؤكم', 'آباؤهم', 'آباؤكم', 'بآبائنا', 'آبائنا', 'آباؤنا', 'والدة'] },
  'anak': { primary: ['ولد', 'ولدا'], contains: 'ولد', lemmaRoot: 'ولد', lemmaForms: ['ولد', 'ولدا', 'ولده', 'أبناءنا', 'وأبناؤكم', 'أبناءهم', 'أبناء', 'ذرية', 'ذريتي', 'وذريته', 'ذريته', 'وذرية', 'ذريتهم', 'ذريتنا', 'وذرياتهم'] },
  'saudara': { primary: ['أخيه', 'إخوة'], contains: 'أخي', lemmaRoot: 'أخ', lemmaForms: ['أخيه', 'أخاه', 'أخاهم', 'وأخاه', 'أخا', 'إخوة', 'إخوان', 'إخوانكم', 'إخوانهم', 'وإخوانهم', 'وإخوانكم', 'لإخوانهم'] },
  'keluarga': { primary: ['أهلك', 'أهله'], contains: 'أهل', lemmaRoot: 'أهل', lemmaForms: ['أهلك', 'أهله', 'أهلي', 'أهلها', 'أهلهم', 'لأهله', 'وأهلك', 'وأهله', 'بأهله'] },
  'suami': { primary: ['أزواج', 'زوج'], contains: 'زوج', lemmaRoot: 'زوج', lemmaForms: ['زوج', 'زوجك', 'وزوجك', 'زوجه', 'أزواجهم', 'أزواجكم', 'أزواجه', 'أزواج', 'وأزواجكم', 'أزواجا', 'وأزواجه', 'وزوجه', 'أزواجك', 'أزواجهن', 'لأزواجهم'] },
  'istri': { primary: ['امرأة', 'نساء'], contains: 'امرأة', lemmaRoot: 'امرأ', lemmaForms: ['امرأة', 'نساء', 'نسائكم', 'نساءكم', 'نساءهم', 'ونساءنا', 'ونساءكم', 'وامرأته', 'امرأتي', 'امرأتك', 'النساء', 'وامرأة', 'ونساء'] },
  'yatim': { primary: ['اليتامى', 'اليتيم'], contains: 'يتم', lemmaRoot: 'يتم', lemmaForms: ['اليتيم', 'اليتامى', 'يتم', 'يتيما', 'يتامى', 'لليتامى', 'واليتامى'] },
  'miskin': { primary: ['المسكين'], contains: 'مسكين', lemmaRoot: 'مسكن', lemmaForms: ['المسكين', 'مسكينا', 'مسكين', 'والمسكين', 'مساكين'] },
  'fakir': { primary: ['الفقراء'], contains: 'فقر', lemmaRoot: 'فقر', lemmaForms: ['الفقراء', 'للفقراء', 'فقير', 'فقيرا', 'فقراء'] },
  'hati': { primary: ['قلوبهم', 'القلوب'], contains: 'قلب', lemmaRoot: 'قلب', lemmaForms: ['قلبه', 'قلبك', 'قلبي', 'قلوبهم', 'قلوبكم', 'قلوبنا', 'بقلب', 'القلوب', 'وقلوبهم', 'قلب'] },
  'qalbu': { primary: ['قلوبهم', 'القلوب'], contains: 'قلب', lemmaRoot: 'قلب', lemmaForms: ['قلبه', 'قلبك', 'قلبي', 'قلوبهم', 'قلوبكم', 'قلوبنا', 'بقلب', 'القلوب', 'وقلوبهم', 'قلب'] },
  'nafsu': { primary: ['النفس', 'أنفسهم'], contains: 'نفس', lemmaRoot: 'نفس', lemmaForms: ['النفس', 'نفس', 'نفسه', 'نفسك', 'نفسي', 'نفسا', 'أنفسهم', 'أنفسكم', 'أنفسنا', 'وأنفسهم', 'لأنفسكم', 'الأنفس', 'وأنفسكم', 'نفسها', 'بأنفسهم'] },
  'akal': { primary: ['تعقلون', 'يعقلون'], contains: 'عقل', lemmaRoot: 'عقل', lemmaForms: ['تعقلون', 'يعقلون', 'نعقل', 'عقلوه', 'يعقلها'] },
  'ilmu': { primary: ['العلم', 'يعلم'], contains: 'علم', lemmaRoot: 'علم', lemmaForms: ['العلم', 'علم', 'علما', 'علمت', 'علمنا', 'علمه', 'بعلمه', 'بعلم', 'يعلم', 'ويعلم', 'تعلم', 'يعلمه', 'يعلمون', 'تعلمون', 'نعلم', 'أعلم', 'العالمين', 'وعلمه', 'وعلم', 'عالم', 'عليم', 'العليم', 'ليعلم', 'فاعلموا', 'واعلموا', 'فاعلم', 'العلماء'] },
  'hikmah': { primary: ['الحكمة', 'والحكمة'], contains: 'حكمة', lemmaRoot: 'حكم', lemmaForms: ['الحكمة', 'والحكمة', 'حكمة', 'بالحكمة', 'وحكمة', 'حكيم', 'الحكيم', 'حكيما'] },
  'cinta': { primary: ['يحب', 'تحبون'], contains: 'حب', lemmaRoot: 'حب', lemmaForms: ['يحب', 'تحبون', 'يحبون', 'أحب', 'لحب', 'حب', 'حبه', 'حبا', 'يحبهم', 'ويحب'] },
  'musuh': { primary: ['عدو', 'العدو'], contains: 'عدو', lemmaRoot: 'عدو', lemmaForms: ['عدو', 'عدوا', 'عدوكم', 'العدو', 'عدوهم', 'أعداء'] },
  'teman': { primary: ['ولي'], contains: 'صاحب', lemmaRoot: 'صحب', lemmaForms: ['لصاحبه', 'صاحبه', 'بصاحبهم', 'صاحبي', 'صاحبكم', 'وصاحبته', 'ولي', 'وليا', 'وليه', 'وليهم', 'ولينا', 'الولي', 'وليكم', 'أولياء', 'أولياؤكم'] },
  'bumi': { primary: ['الأرض', 'والأرض'], contains: 'أرض', lemmaRoot: 'أرض', lemmaForms: ['الأرض', 'والأرض', 'أرض', 'أرضكم', 'أرضنا', 'أرضا', 'وأرضا'] },
  'langit': { primary: ['السماء', 'السماوات'], contains: 'سماء', lemmaRoot: 'سمو', lemmaForms: ['السماء', 'السماوات', 'والسماء', 'سماوات', 'والسماوات', 'سماء'] },
  'air': { primary: ['الماء', 'ماء'], contains: 'ماء', lemmaRoot: 'ماء', lemmaForms: ['الماء', 'ماء', 'وماء', 'بماء', 'كماء', 'ماؤها', 'ماؤكم'] },
  'laut': { primary: ['البحر', 'والبحر'], contains: 'بحر', lemmaRoot: 'بحر', lemmaForms: ['البحر', 'والبحر', 'البحرين', 'بحر'] },
  'gunung': { primary: ['الجبال', 'الجبل'], contains: 'جبل', lemmaRoot: 'جبل', lemmaForms: ['الجبل', 'الجبال', 'جبل', 'جبلا', 'والجبال', 'للجبل'] },
  'pohon': { primary: ['الشجرة', 'شجرة'], contains: 'شجر', lemmaRoot: 'شجر', lemmaForms: ['الشجرة', 'شجرة', 'شجر', 'كشجرة', 'الشجر', 'والشجر'] },
  'buah': { primary: ['الثمرات', 'فاكهة'], contains: 'ثمر', lemmaRoot: 'ثمر', lemmaForms: ['الثمرات', 'فاكهة', 'ثمرات', 'ثمره', 'وفاكهة', 'بفاكهة', 'فاكهين', 'بثمره', 'ثمر'] },
  'burung': { primary: ['الطير', 'والطير'], contains: 'طير', lemmaRoot: 'طير', lemmaForms: ['الطير', 'والطير', 'طيرا'] },
  'binatang': { primary: ['دابة', 'الأنعام'], contains: 'دابة', lemmaRoot: 'دبب', lemmaForms: ['دابة', 'الدواب', 'الأنعام', 'أنعام'] },
  'hewan': { primary: ['دابة', 'الأنعام'], contains: 'دابة', lemmaRoot: 'دبب', lemmaForms: ['دابة', 'الدواب', 'الأنعام', 'أنعام'] },
  'mati': { primary: ['الموت', 'الموتى'], contains: 'موت', lemmaRoot: 'موت', lemmaForms: ['الموت', 'الموتى', 'موتها', 'يموت', 'تموتن', 'موتوا', 'تموت', 'موته', 'نموت', 'موتتنا', 'ميتا', 'ميتة', 'ويميت', 'ميت', 'أموات', 'بميت'] },
  'hidup': { primary: ['الحياة', 'حياة'], contains: 'حياة', lemmaRoot: 'حي', lemmaForms: ['الحياة', 'حياة', 'يحيي', 'وأحيا', 'أحيا', 'فأحيا', 'وأحيينا', 'نحيي', 'حييتم', 'للحي'] },
  'tanah': { primary: ['التراب', 'تراب'], contains: 'تراب', lemmaRoot: 'ترب', lemmaForms: ['تراب', 'ترابا', 'التراب'] },
  'debu': { primary: ['التراب', 'تراب'], contains: 'تراب', lemmaRoot: 'ترب', lemmaForms: ['تراب', 'ترابا', 'التراب'] },
  'hujan': { primary: ['مطر', 'وأمطرنا'], contains: 'مطر', lemmaRoot: 'مطر', lemmaForms: ['مطر', 'مطرا', 'وأمطرنا'] },
  'kitab': { primary: ['الكتاب', 'كتاب'], contains: 'كتاب', lemmaRoot: 'كتب', lemmaForms: ['الكتاب', 'كتاب', 'وكتاب', 'بكتاب', 'كتابا', 'بالكتاب', 'لكتاب', 'كتابك', 'كتبنا', 'وكتبنا', 'يكتبون', 'كتب', 'كتبت', 'يكتب', 'فاكتبنا', 'سنكتب', 'وكتبه'] },
  'rumah': { primary: ['البيت', 'بيوت'], contains: 'بيت', lemmaRoot: 'بيت', lemmaForms: ['البيت', 'بيت', 'بيتا', 'بيتي', 'بيتك', 'بيتها', 'لبيت', 'بالبيت', 'بيوت', 'البيوت', 'بيوتا', 'بيوتهم', 'بيوتكم', 'بيوتهن', 'ولبيوتهم', 'بيوتنا'] },
  'pintu': { primary: ['الباب', 'باب'], contains: 'باب', lemmaRoot: 'بوب', lemmaForms: ['الباب', 'باب', 'بابا', 'أبوابا', 'أبواب'] },
  'tujuh': { primary: ['سبع', 'السبع'], contains: 'سبع', lemmaRoot: 'سبع', lemmaForms: ['سبع', 'السبع', 'سبعة', 'سبعين', 'وسبع', 'سبعا', 'سبعون'] },
  'empatpuluh': { primary: ['أربعين'], contains: 'أربع', lemmaRoot: 'ربع', lemmaForms: ['أربعين', 'أربعة', 'أربع'] },
  'seribu': { primary: ['ألف', 'آلاف'], contains: 'ألف', lemmaRoot: 'ألف', lemmaForms: ['ألف', 'ألفا', 'بألف', 'آلاف'] },
  'ratus': { primary: ['مائة', 'مائتين'], contains: 'مائة', lemmaRoot: 'مئة', lemmaForms: ['مائة', 'مائتين'] },
  'pahala': { primary: ['أجر', 'أجرا'], contains: 'أجر', lemmaRoot: 'أجر', lemmaForms: ['أجر', 'أجرا', 'أجرهم', 'أجري', 'وأجر', 'أجره', 'لأجرا', 'ولأجر', 'فأجره', 'وأجرا', 'ثواب', 'ثوابا'] },
  'amal': { primary: ['أعمالهم', 'عمل'], contains: 'عمل', lemmaRoot: 'عمل', lemmaForms: ['عمل', 'تعملون', 'يعملون', 'وعملوا', 'عملوا', 'وعمل', 'يعمل', 'عملا', 'اعملوا', 'عملت', 'نعمل', 'عمله', 'أعمالهم', 'أعمالكم', 'أعمالنا', 'أعمال', 'نعمل', 'عملته', 'عملكم'] },
  'maaf': { primary: ['العفو', 'يعفو'], contains: 'عفو', lemmaRoot: 'عفو', lemmaForms: ['العفو', 'عفوا', 'تعفوا', 'ويعفو', 'يعفو', 'لعفو', 'عفا', 'وليعفوا'] },
  'janji': { primary: ['وعد', 'العهد'], contains: 'عهد', lemmaRoot: 'عهد', lemmaForms: ['وعد', 'وعدنا', 'وعدا', 'وعده', 'بعهد', 'عهد', 'العهد', 'وعهدنا', 'عهدا', 'عهدهم', 'بعهدي', 'عهدي', 'ميثاق', 'ميثاقا', 'ميثاقكم', 'بميثاقهم', 'ميثاقه'] },
  'kabar': { primary: ['نبأ'], contains: 'نبأ', lemmaRoot: 'نبأ', lemmaForms: ['نبأ', 'ينبأ', 'أنبئهم', 'نبأهم', 'تنبئونه', 'سأنبئك'] },
  'kisah': { primary: ['القصص'], contains: 'قصص', lemmaRoot: 'قصص', lemmaForms: ['القصص', 'قصصنا', 'قصصهم'] },
  'ikan': { primary: ['الحوت'], contains: 'حوت', lemmaRoot: 'حوت', lemmaForms: ['الحوت', 'حوتهما', 'حيتانهم'] },
  'sapi': { primary: ['بقرة'], contains: 'بقر', lemmaRoot: 'بقر', lemmaForms: ['بقرة', 'البقر', 'بقرات'] },
  'unta': { primary: ['الناقة', 'ناقة'], contains: 'ناقة', lemmaRoot: 'نوق', lemmaForms: ['ناقة', 'الناقة'] },
  'kurma': { primary: ['النخل', 'والنخل'], contains: 'نخل', lemmaRoot: 'نخل', lemmaForms: ['النخل', 'والنخل', 'نخل', 'ونخل', 'النخلة'] },
  'zaitun': { primary: ['والزيتون'], contains: 'زيتون', lemmaRoot: 'زتن', lemmaForms: ['والزيتون', 'زيتونة'] },
  'warisan': { primary: ['أورثنا'], contains: 'أورث', lemmaRoot: 'ورث', lemmaForms: ['أورثنا', 'وأورثنا', 'أورثتموها', 'وأورثناها', 'يرثون', 'ترثوا', 'نرث'] },
  'mimpi': { primary: ['الرؤيا', 'رؤياي'], contains: 'رؤي', lemmaRoot: 'رأي', lemmaForms: ['الرؤيا', 'رؤياي', 'رؤياك'] },
  'perlindungan': { primary: ['أعوذ'], contains: 'عوذ', lemmaRoot: 'عوذ', lemmaForms: ['أعوذ', 'وأعوذ', 'فاستعذ'] },
  'ridha': { primary: ['رضي', 'يرضى'], contains: 'رضي', lemmaRoot: 'رضو', lemmaForms: ['رضي', 'يرضى', 'رضوا', 'ترضى', 'رضيا', 'لترضى', 'مرضية', 'رضوان', 'ورضوان', 'مرضيا', 'ترضاها'] },
}

export function transliterate(input: string): string[] {
  const lower = input.trim().toLowerCase()
  const entry = TRANSLIT_MAP[lower]
  if (entry) {
    return entry.primary.map(normalize)
  }
  return []
}

// Get the right search term based on mode for transliterated queries
function getTranslitTerm(query: string, mode: 'exact' | 'contains' | 'lemma' | 'root'): string | null {
  const lower = query.trim().toLowerCase()
  const entry = TRANSLIT_MAP[lower]
  if (!entry) return null
  if (mode === 'exact') return normalize(entry.primary[0])
  if (mode === 'contains') return normalize(entry.contains)
  // lemma/root: use the shortest root pattern
  return normalize(entry.lemmaRoot)
}

// ── Detect Arabic ──────────────────────────────────────────────────────────

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text)
}

// ── Resolve query to Arabic normalized forms ───────────────────────────────

function resolveArabicTerms(query: string): string[] {
  const trimmed = query.trim()
  if (isArabic(trimmed)) {
    return [normalize(trimmed)]
  }
  const forms = transliterate(trimmed)
  if (forms.length > 0) return forms
  // fallback: return the raw input normalized
  return [normalize(trimmed)]
}

// ── Search functions ───────────────────────────────────────────────────────

export function searchExact(
  term: string,
  verses: Verse[],
  wordIndex: WordIndex
): { count: number; verseIds: number[] } {
  const normalized = normalize(term)
  const entries = wordIndex[normalized]
  if (!entries) return { count: 0, verseIds: [] }
  const uniqueVerses = [...new Set(entries.map(e => e.verse_id))]
  return { count: entries.length, verseIds: uniqueVerses }
}

export function searchContains(
  term: string,
  _verses: Verse[],
  wordIndex: WordIndex
): { count: number; verseIds: number[] } {
  const normalized = normalize(term)
  const verseSet = new Set<number>()
  let count = 0
  const tokens = Object.keys(wordIndex)
  for (const token of tokens) {
    if (token.includes(normalized)) {
      const entries = wordIndex[token]
      count += entries.length
      for (const e of entries) verseSet.add(e.verse_id)
    }
  }
  return { count, verseIds: [...verseSet].sort((a, b) => a - b) }
}

export function searchLemma(
  term: string,
  _verses: Verse[],
  wordIndex: WordIndex
): { count: number; verseIds: number[]; breakdown: { form: string; count: number }[] } {
  const normalized = normalize(term)
  // Support pipe-separated patterns for multi-form lemmas (e.g. شيط|شياطين)
  const patterns = normalized.split('|').map(p => p.trim()).filter(Boolean)
  const verseSet = new Set<number>()
  const breakdown: { form: string; count: number }[] = []
  let totalCount = 0
  const tokens = Object.keys(wordIndex)

  for (const token of tokens) {
    const matches = patterns.some(pattern => token.includes(pattern))
    if (matches) {
      const entries = wordIndex[token]
      breakdown.push({ form: token, count: entries.length })
      totalCount += entries.length
      for (const e of entries) verseSet.add(e.verse_id)
    }
  }

  breakdown.sort((a, b) => b.count - a.count)
  return { count: totalCount, verseIds: [...verseSet].sort((a, b) => a - b), breakdown }
}

/** LEMMA search berbasis daftar token eksplisit (lemmaForms): presisi penuh,
 *  tanpa tabrakan substring. Mengembalikan bentuk yang sama dengan searchLemma. */
export function searchByForms(
  forms: string[],
  wordIndex: WordIndex
): { count: number; verseIds: number[]; breakdown: { form: string; count: number }[] } {
  const verseSet = new Set<number>()
  const breakdown: { form: string; count: number }[] = []
  let totalCount = 0
  for (const form of forms) {
    const entries = wordIndex[normalize(form)]
    if (!entries) continue
    breakdown.push({ form: normalize(form), count: entries.length })
    totalCount += entries.length
    for (const e of entries) verseSet.add(e.verse_id)
  }
  breakdown.sort((a, b) => b.count - a.count)
  return { count: totalCount, verseIds: [...verseSet].sort((a, b) => a - b), breakdown }
}

// ── Main search dispatcher ─────────────────────────────────────────────────

export function search(
  query: string,
  mode: 'exact' | 'contains' | 'lemma' | 'root',
  verses: Verse[],
  wordIndex: WordIndex
): SearchResult {
  const trimmed = query.trim()
  const isAr = isArabic(trimmed)
  
  // For transliterated queries, use mode-specific term resolution
  const translitTerm = !isAr ? getTranslitTerm(trimmed, mode) : null
  
  // Determine the search term based on mode
  let searchTerm: string
  if (isAr) {
    searchTerm = normalize(trimmed)
  } else if (translitTerm) {
    searchTerm = translitTerm
  } else {
    searchTerm = normalize(trimmed)
  }
  
  // Display term (for UI)
  const displayTerm = isAr ? normalize(trimmed) : (transliterate(trimmed)[0] || normalize(trimmed))

  if (mode === 'exact') {
    // For exact: try the primary form(s)
    const forms = !isAr ? (TRANSLIT_MAP[trimmed.toLowerCase()]?.primary.map(normalize) || [searchTerm]) : [searchTerm]
    const allVerseIds = new Set<number>()
    let totalCount = 0
    for (const form of forms) {
      const r = searchExact(form, verses, wordIndex)
      totalCount += r.count
      for (const id of r.verseIds) allVerseIds.add(id)
    }
    return {
      query, arabicTerm: displayTerm, mode, totalCount,
      verseIds: [...allVerseIds].sort((a, b) => a - b),
    }
  }

  if (mode === 'contains') {
    const r = searchContains(searchTerm, verses, wordIndex)
    return {
      query, arabicTerm: displayTerm, mode, totalCount: r.count,
      verseIds: r.verseIds,
    }
  }

  if (mode === 'lemma' || mode === 'root') {
    // LEMMA memakai lemmaForms eksplisit bila entri punya (presisi);
    // ROOT selalu pola akar substring (paling luas).
    const entry = !isAr ? TRANSLIT_MAP[trimmed.toLowerCase()] : undefined
    if (mode === 'lemma' && entry?.lemmaForms?.length) {
      const r = searchByForms(entry.lemmaForms, wordIndex)
      return {
        query, arabicTerm: displayTerm, mode, totalCount: r.count,
        verseIds: r.verseIds, breakdown: r.breakdown,
      }
    }
    const r = searchLemma(searchTerm, verses, wordIndex)
    return {
      query, arabicTerm: displayTerm, mode, totalCount: r.count,
      verseIds: r.verseIds, breakdown: r.breakdown,
    }
  }

  return { query, arabicTerm: displayTerm, mode, totalCount: 0, verseIds: [] }
}

// ── Highlight helper ───────────────────────────────────────────────────────

type HighlightMode = 'exact' | 'contains' | 'lemma' | 'root'

/**
 * Build the word matcher for highlighting. It mirrors the ACTIVE search mode
 * exactly — a word is highlighted iff the search in that mode counts it.
 * (Sebelumnya highlight hanya tahu bentuk primary, jadi ayat yang tertangkap
 * mode Lemma/+Awalan lewat pola lain tidak ter-highlight sama sekali.)
 */
function buildHighlighter(searchQuery: string, mode: HighlightMode): (normalizedWord: string) => boolean {
  const trimmed = searchQuery.trim()
  if (isArabic(trimmed)) {
    const term = normalize(trimmed)
    return mode === 'exact'
      ? (w) => w === term
      : (w) => w.includes(term)
  }
  const entry = TRANSLIT_MAP[trimmed.toLowerCase()]
  if (!entry) {
    const term = normalize(trimmed)
    return (w) => w.includes(term)
  }
  if (mode === 'exact') {
    const forms = entry.primary.map(normalize)
    return (w) => forms.includes(w)
  }
  if (mode === 'contains') {
    const pattern = normalize(entry.contains)
    return (w) => w.includes(pattern)
  }
  if (mode === 'lemma' && entry.lemmaForms?.length) {
    const formSet = new Set(entry.lemmaForms.map(normalize))
    return (w) => formSet.has(w)
  }
  const patterns = normalize(entry.lemmaRoot).split('|').map((p) => p.trim()).filter(Boolean)
  return (w) => patterns.some((p) => w.includes(p))
}

export interface MatchedToken {
  pos: number
  token: string
}

/**
 * Token predicate that mirrors search() for the active mode, applied to
 * word-index tokens (ejaan imla'i). Dipakai untuk highlight berbasis posisi:
 * teks Utsmani ejaannya berbeda sistematis dari token indeks (ٱلدُّنْيَا vs
 * الدنيا، الشيطن vs الشيطان), jadi mencocokkan string ke teks Utsmani mentah
 * PASTI meleset — yang setia adalah posisi tokennya (indeks menunjuk token
 * text_simple, terverifikasi 99,95%).
 */
function buildTokenPredicate(searchQuery: string, mode: HighlightMode): (token: string) => boolean {
  const trimmed = searchQuery.trim()
  if (isArabic(trimmed)) {
    const term = normalize(trimmed)
    return mode === 'exact' ? (t) => t === term : (t) => t.includes(term)
  }
  const entry = TRANSLIT_MAP[trimmed.toLowerCase()]
  if (!entry) {
    const term = normalize(trimmed)
    return (t) => t.includes(term)
  }
  if (mode === 'exact') {
    const forms = entry.primary.map(normalize)
    return (t) => forms.includes(t)
  }
  if (mode === 'contains') {
    const pattern = normalize(entry.contains)
    return (t) => t.includes(pattern)
  }
  if (mode === 'lemma' && entry.lemmaForms?.length) {
    const formSet = new Set(entry.lemmaForms.map(normalize))
    return (t) => formSet.has(t)
  }
  const patterns = normalize(entry.lemmaRoot).split('|').map((p) => p.trim()).filter(Boolean)
  return (t) => patterns.some((p) => t.includes(p))
}

/** Semua token yang cocok dengan query+mode, dikelompokkan per ayat, dari word-index. */
export function matchedTokensByVerse(
  searchQuery: string,
  mode: HighlightMode,
  wordIndex: WordIndex
): Map<number, MatchedToken[]> {
  const predicate = buildTokenPredicate(searchQuery, mode)
  const map = new Map<number, MatchedToken[]>()
  for (const token of Object.keys(wordIndex)) {
    if (!predicate(token)) continue
    for (const e of wordIndex[token]) {
      const arr = map.get(e.verse_id)
      if (arr) arr.push({ pos: e.position, token })
      else map.set(e.verse_id, [{ pos: e.position, token }])
    }
  }
  return map
}

/**
 * Highlight kata pada teks Utsmani berdasarkan posisi token yang cocok.
 * Bila jumlah kata Utsmani == simple, posisi memetakan 1:1 (dengan koreksi
 * drift ±1 yang diverifikasi ke token simple). Bila beda (360-an ayat, kata
 * bergandeng di ejaan Utsmani), posisi dipetakan proporsional. Fallback
 * terakhir: predicate yang sama dites ke kata Utsmani yang dinormalisasi.
 */
export function highlightArabic(
  uthmaniText: string,
  simpleText: string,
  matched: MatchedToken[] | undefined,
  searchQuery: string,
  mode: HighlightMode = 'exact'
): string {
  const parts = uthmaniText.split(/(\s+)/)
  const uWordIdx: number[] = [] // index ke parts untuk tiap kata ke-i
  parts.forEach((part, i) => {
    if (!/^\s+$/.test(part) && part !== '') uWordIdx.push(i)
  })
  const sWords = simpleText.split(/\s+/).filter(Boolean)
  const highlighted = new Set<number>() // nomor urut kata (0-based, basis kata)

  if (matched && matched.length > 0) {
    if (uWordIdx.length === sWords.length && sWords.length > 0) {
      for (const m of matched) {
        let placed = false
        for (const q of [m.pos, m.pos - 1, m.pos + 1]) {
          if (q >= 0 && q < sWords.length && normalize(sWords[q]) === m.token) {
            highlighted.add(q)
            placed = true
            break
          }
        }
        if (!placed && m.pos >= 0 && m.pos < uWordIdx.length) highlighted.add(m.pos)
      }
    } else if (sWords.length > 1 && uWordIdx.length > 0) {
      for (const m of matched) {
        const q = Math.round((m.pos * (uWordIdx.length - 1)) / (sWords.length - 1))
        if (q >= 0 && q < uWordIdx.length) highlighted.add(q)
      }
    }
  }

  // Fallback: predicate mode dites ke kata Utsmani ternormalisasi
  const matches = buildHighlighter(searchQuery, mode)
  uWordIdx.forEach((partIdx, wordNo) => {
    if (!highlighted.has(wordNo) && matches(normalize(parts[partIdx]))) {
      highlighted.add(wordNo)
    }
  })

  let wordNo = -1
  return parts
    .map((part) => {
      if (/^\s+$/.test(part) || part === '') return part
      wordNo++
      return highlighted.has(wordNo)
        ? `<span class="bg-gold/22 rounded-[3px] px-[3px] py-[1px]">${part}</span>`
        : part
    })
    .join('')
}
