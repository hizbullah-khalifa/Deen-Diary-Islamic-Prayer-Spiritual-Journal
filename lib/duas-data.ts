export type DuaCategory =
  | "morning"
  | "evening"
  | "sleep"
  | "waking"
  | "eating-before"
  | "eating-after"
  | "travel"
  | "protection"
  | "forgiveness"
  | "anxiety"
  | "parents"
  | "knowledge"
  | "rizq"
  | "health"
  | "marriage"
  | "success"
  | "ramadan"
  | "hajj";

export interface Dua {
  id: string;
  category: DuaCategory[];
  titleEn: string;
  titleUr: string;
  arabic: string;
  transliteration: string;
  en: string;
  ur: string;
  reference: string;
  tags: string[];
}

export const DUA_CATEGORIES: { key: DuaCategory; labelEn: string; labelUr: string }[] = [
  { key: "morning", labelEn: "Morning Duas", labelUr: "صبح کی دعائیں" },
  { key: "evening", labelEn: "Evening Duas", labelUr: "شام کی دعائیں" },
  { key: "sleep", labelEn: "Before Sleeping", labelUr: "سونے سے پہلے" },
  { key: "waking", labelEn: "After Waking", labelUr: "جاگنے کے بعد" },
  { key: "eating-before", labelEn: "Before Eating", labelUr: "کھانے سے پہلے" },
  { key: "eating-after", labelEn: "After Eating", labelUr: "کھانے کے بعد" },
  { key: "travel", labelEn: "Travel", labelUr: "سفر" },
  { key: "protection", labelEn: "Protection", labelUr: "حفاظت" },
  { key: "forgiveness", labelEn: "Forgiveness", labelUr: "بخشش" },
  { key: "anxiety", labelEn: "Anxiety & Difficulty", labelUr: "پریشانی اور مشکل" },
  { key: "parents", labelEn: "Parents", labelUr: "والدین" },
  { key: "knowledge", labelEn: "Knowledge", labelUr: "علم" },
  { key: "rizq", labelEn: "Rizq (Provision)", labelUr: "رزق" },
  { key: "health", labelEn: "Health", labelUr: "صحت" },
  { key: "marriage", labelEn: "Marriage", labelUr: "شادی" },
  { key: "success", labelEn: "Success", labelUr: "کامیابی" },
  { key: "ramadan", labelEn: "Ramadan", labelUr: "رمضان" },
  { key: "hajj", labelEn: "Hajj & Umrah", labelUr: "حج و عمرہ" },
];

const dua = (
  id: string,
  category: DuaCategory[],
  titleEn: string,
  titleUr: string,
  arabic: string,
  transliteration: string,
  en: string,
  ur: string,
  reference: string,
  tags: string[]
): Dua => ({ id, category, titleEn, titleUr, arabic, transliteration, en, ur, reference, tags });

export const DUAS: Dua[] = [
  dua("rabbana-atina", ["success", "morning"], "Rabbana Atina", "ربنا آتنا",
    "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
    "Our Lord, give us in this world that which is good and in the Hereafter that which is good, and protect us from the punishment of the Fire.",
    "اے ہمارے رب! ہمیں دنیا میں بھی بھلائی عطا فرما اور آخرت میں بھی بھلائی عطا فرما اور ہمیں آگ کے عذاب سے بچا لے۔",
    "Qur'an 2:201",
    ["rizq", "success"]),
  dua("rabbana-la-tuzigh", ["success"], "Keep Our Hearts Firm", "دلوں کو ثابت رکھ",
    "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ",
    "Rabbana la tuzigh qulubana ba'da idh hadaytana wa hab lana min ladunka rahmatan innaka antal-wahhab",
    "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.",
    "اے ہمارے رب! ہدایت دینے کے بعد ہمارے دلوں کو ٹیڑھا نہ کر اور ہمیں اپنی طرف سے رحمت عطا فرما۔ بے شک تو ہی عطا کرنے والا ہے۔",
    "Qur'an 3:8",
    []),
  dua("bismika-amutu", ["sleep"], "Before Sleeping", "سونے سے پہلے",
    "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    "Bismika allahumma amutu wa ahya",
    "In Your name, O Allah, I die and I live.",
    "اے اللہ! تیرے نام کے ساتھ میں مرتا اور جیتا ہوں۔",
    "Sahih al-Bukhari 6324",
    ["protection"]),
  dua("alhamdulillah-ahyana", ["waking"], "After Waking", "جاگنے کے بعد",
    "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    "Praise is to Allah who gave us life after having given us death, and to Him is the return.",
    "تمام تعریفیں اس اللہ کے لیے ہیں جس نے موت کے بعد ہمیں زندہ کیا اور اسی کی طرف لوٹنا ہے۔",
    "Sahih al-Bukhari 6312",
    []),
  dua("bismillah-walajna", ["protection", "morning"], "Entering the Home", "گھر میں داخل ہوتے وقت",
    "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    "Allahumma inni as'aluka khayral-mawliji wa khayral-makhraji bismillahi walajna wa bismillahi kharajna wa 'alallahi rabbina tawakkaina",
    "O Allah, I ask You for the good of entering and the good of leaving. In the name of Allah we enter and in the name of Allah we leave, and upon Allah our Lord we rely.",
    "اے اللہ! میں تجھ سے داخل ہونے اور نکلنے کی بھلائی طلب کرتا ہوں۔ اللہ کے نام سے ہم داخل ہوئے اور اللہ کے نام سے نکلے، اور اپنے رب اللہ پر ہم نے بھروسہ کیا۔",
    "Sunan Abi Dawud 5096",
    ["home"]),
  dua("bismillah-tawakkaltu", ["travel", "protection"], "Leaving the Home", "گھر سے نکلتے وقت",
    "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    "Bismillahi tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah",
    "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.",
    "اللہ کے نام سے، میں نے اللہ پر بھروسہ کیا، اور طاقت و قدرت صرف اللہ ہی کے پاس ہے۔",
    "Sunan Abi Dawud 5095, At-Tirmidhi 3426",
    []),
  dua("bismillah-talaq", ["eating-before"], "Before Eating", "کھانے سے پہلے",
    "بِسْمِ اللَّهِ",
    "Bismillah",
    "In the name of Allah.",
    "اللہ کے نام سے۔",
    "Sahih al-Bukhari 5376",
    []),
  dua("alhamdulillah-atamana", ["eating-after"], "After Eating", "کھانے کے بعد",
    "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
    "Praise is to Allah who fed us, gave us drink, and made us Muslims.",
    "تمام تعریفیں اس اللہ کے لیے ہیں جس نے ہمیں کھلایا، پلایا اور مسلمان بنایا۔",
    "Sunan Abi Dawud 3850, At-Tirmidhi 3457",
    []),
  dua("subhanalladhi-sakhkhara", ["travel"], "Travel Dua", "سفر کی دعا",
    "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun",
    "Glory be to Him who has subjected this to us, and we could not have done it otherwise. And indeed to our Lord we will return.",
    "پاک ہے وہ ذات جس نے اسے ہمارے تابع کیا، ورنہ ہم اس کی طاقت نہ رکھتے تھے، اور ہم اپنے رب کی طرف لوٹ کر جانے والے ہیں۔",
    "Qur'an 43:13-14",
    []),
  dua("rabbirhamhuma", ["parents"], "Dua for Parents", "والدین کے لیے دعا",
    "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    "Rabbir-hamhuma kama rabbayani saghira",
    "My Lord, have mercy on them as they brought me up when I was small.",
    "اے میرے رب! ان دونوں پر رحم فرما جیسا انہوں نے بچپن میں مجھے پالا۔",
    "Qur'an 17:24",
    ["forgiveness"]),
  dua("rabbana-ghfirli", ["forgiveness"], "Dua for Forgiveness", "بخشش کی دعا",
    "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    "Rabbana-ghfir li wa li-walidayya wa lil-mu'minina yawma yaqumul-hisab",
    "Our Lord, forgive me and my parents and the believers on the Day the account is established.",
    "اے ہمارے رب! مجھے، میرے والدین کو اور تمام مومنین کو اس دن بخش دے جب حساب قائم ہوگا۔",
    "Qur'an 14:41",
    ["parents"]),
  dua("rabbishrahli", ["knowledge", "anxiety"], "Ease of Affairs", "کام میں آسانی",
    "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",
    "Rabbish-rahli sadri wa yassir li amri wahlul 'uqdata min lisani yafqahu qawli",
    "My Lord, expand for me my chest and ease for me my task and untie the knot from my tongue that they might understand my speech.",
    "اے میرے رب! میرا سینہ کھول دے، میرا کام آسان فرما، اور میری زبان کی گرہ کھول دے تاکہ لوگ میری بات سمجھ سکیں۔",
    "Qur'an 20:25-28",
    ["success"]),
  dua("rabba-zidni-ilma", ["knowledge"], "Increase in Knowledge", "علم میں اضافہ",
    "رَبِّ زِدْنِي عِلْمًا",
    "Rabbi zidni 'ilma",
    "My Lord, increase me in knowledge.",
    "اے میرے رب! مجھے علم میں اضافہ عطا فرما۔",
    "Qur'an 20:114",
    []),
  dua("allahumma-’afini", ["health", "protection"], "Dua for Health", "صحت کی دعا",
    "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
    "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa anta",
    "O Allah, grant me health in my body, O Allah, grant me health in my hearing, O Allah, grant me health in my sight. There is no god but You.",
    "اے اللہ! میرے جسم کو صحت عطا فرما، اے اللہ! میری سماعت کو صحت دے، اے اللہ! میری بینائی کو صحت دے۔ تیرے سوا کوئی معبود نہیں۔",
    "Sunan Abi Dawud 5090",
    []),
  dua("allhumma-kafini", ["rizq"], "Sufficiency from Allah", "کفایت کی دعا",
    "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    "Allahumma-kfini bi halalika 'an haramika wa aghnini bi fadlika 'amman siwaka",
    "O Allah, suffice me with what You have made lawful against what You have made unlawful, and enrich me by Your grace from everything else.",
    "اے اللہ! مجھے حلال سے کفایت فرما حرام سے، اور اپنے فضل سے مجھے اپنے سوا دوسروں سے بے نیاز فرما۔",
    "Sunan At-Tirmidhi 3563",
    ["success"]),
  dua("rabbana-hab-lana", ["marriage", "success"], "Dua for Family", "گھرانے کے لیے دعا",
    "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama",
    "Our Lord, grant us from our spouses and our offspring comfort to our eyes and make us leaders of the righteous.",
    "اے ہمارے رب! ہمیں ہماری بیویوں اور اولاد سے آنکھوں کی ٹھنڈک عطا فرما، اور ہمیں متقیوں کا امام بنا دے۔",
    "Qur'an 25:74",
    ["success"]),
  dua("allhumma-inna-astaakhiruka", ["success", "anxiety"], "Istikhara (Seeking Guidance)", "استخارہ",
    "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ وَتَعْلَمُ وَلَا أَعْلَمُ وَأَنْتَ عَلَّامُ الْغُيُوبِ",
    "Allahumma inni astakhiruka bi 'ilmika wa astaqdiruka bi qudratika wa as'aluka min fadlikal-'azim, fa innaka taqdiru wa la aqdiru wa ta'lamu wa la a'lamu wa anta 'allamul-ghuyub",
    "O Allah, I seek Your guidance through Your knowledge and Your ability through Your power, and I ask You from Your great bounty. For You are able while I am not, and You know while I do not, and You are the Knower of the unseen.",
    "اے اللہ! میں تیرے علم سے بھلائی مانگتا ہوں اور تیری قدرت سے طاقت مانگتا ہوں اور تیرے عظیم فضل سے سوال کرتا ہوں۔ بے شک تو قدرت رکھتا ہے اور میں نہیں رکھتا، تو جانتا ہے اور میں نہیں جانتا، اور تو غیب کا جاننے والا ہے۔",
    "Sahih al-Bukhari 1162",
    []),
  dua("allhumma-khafir", ["ramadan", "protection"], "Dua of Laylatul Qadr", "شب قدر کی دعا",
    "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni",
    "O Allah, You are Most Forgiving and love forgiveness, so forgive me.",
    "اے اللہ! تو بڑا معاف کرنے والا ہے اور معافی کو پسند کرتا ہے، سو مجھے معاف فرما دے۔",
    "At-Tirmidhi 3513, Ibn Majah 3850",
    ["forgiveness"]),
  dua("sabbiha-ismarabbika", ["morning", "evening"], "Tasbih of Glorification", "تسبیح بقدر",
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    "Subhanallahi wa bihamdihi",
    "Glory be to Allah and all praise is to Him.",
    "اللہ پاک ہے اور اس کی تعریف کے ساتھ (میں اس کی مدح کرتا ہوں)۔",
    "Sahih al-Bukhari 6405",
    ["dhikr"]),
  dua("alqareeb-il-mujib", ["evening"], "Evening Protection", "شام کی حفاظت",
    "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    "میں اللہ کے کامل کلمات کی پناہ مانگتا ہوں اس کی مخلوق کے شر سے۔",
    "Sahih Muslim 2708",
    ["protection"]),
  dua("manzil", ["travel", "protection"], "Prayer for Safe Stay", "قیام کی دعا",
    "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    "میں اللہ کے کامل کلمات کی پناہ مانگتا ہوں اس کی مخلوق کے شر سے۔",
    "Sahih Muslim 2708",
    []),
  dua("rabbihina", ["hajj"], "Talbiyah (Hajj & Umrah)", "تلبیہ",
    "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
    "Labbayka Allahumma labbayk, labbayka la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak",
    "Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Truly, praise and grace are Yours, and the dominion — You have no partner.",
    "حاضر ہوں اے اللہ! حاضر ہوں۔ حاضر ہوں، تیرا کوئی شریک نہیں، حاضر ہوں۔ بے شک حمد اور نعمت تیری ہی ہے اور بادشاہی بھی۔ تیرا کوئی شریک نہیں۔",
    "Sahih al-Bukhari 1549, Sahih Muslim 1184",
    []),
];

export function getDuasByCategory(cat: DuaCategory | null): Dua[] {
  if (!cat) return DUAS;
  return DUAS.filter((d) => d.category.includes(cat));
}