export type ReminderKind = "hadith" | "quran" | "dua" | "reminder";

export interface DailyReminder {
  kind: ReminderKind;
  text: string;
  textUr: string;
  source: string;
  reference: string;
}

export const DAILY_REMINDERS: DailyReminder[] = [
  {
    kind: "hadith",
    text: "Actions are only by intentions, and every person will have only what they intended.",
    textUr: "اعمال کا دارومدار نیتوں پر ہے، اور ہر شخص کو وہی ملے گا جس کی اس نے نیت کی۔",
    source: "Sahih al-Bukhari 1",
    reference: "Sahih Muslim 1907",
  },
  {
    kind: "hadith",
    text: "Whoever is deprived of gentleness is deprived of all good.",
    textUr: "جسے نرمی سے محروم کیا گیا، وہ ہر بھلائی سے محروم ہو گیا۔",
    source: "Sahih Muslim 2592",
    reference: "Sahih Muslim 2592",
  },
  {
    kind: "hadith",
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    textUr: "تم میں سے کوئی اس وقت تک مومن نہیں ہوتا جب تک اپنے بھائی کے لیے وہی پسند نہ کرے جو اپنے لیے پسند کرتا ہے۔",
    source: "Sahih al-Bukhari 13",
    reference: "Sahih Muslim 45",
  },
  {
    kind: "hadith",
    text: "The most beloved of deeds to Allah are those which are most consistent, even if they are small.",
    textUr: "اللہ کے نزدیک سب سے محبوب عمل وہ ہے جو ہمیشگی کے ساتھ کیا جائے، چاہے تھوڑا ہی ہو۔",
    source: "Sahih al-Bukhari 6464",
    reference: "Sahih Muslim 783",
  },
  {
    kind: "hadith",
    text: "The best among you are those who learn the Qur'an and teach it.",
    textUr: "تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔",
    source: "Sahih al-Bukhari 5027",
    reference: "Sahih al-Bukhari 5027",
  },
  {
    kind: "hadith",
    text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    textUr: "جو اللہ اور یوم آخرت پر ایمان رکھتا ہو، وہ بھلی بات کہے یا خاموش رہے۔",
    source: "Sahih al-Bukhari 6018",
    reference: "Sahih Muslim 47",
  },
  {
    kind: "hadith",
    text: "The strong one is not the one who overcomes people by wrestling; the strong one is the one who controls himself when angry.",
    textUr: "قوی وہ نہیں جو کشتی میں جیت جائے؛ قوی وہ ہے جو غصے کے وقت اپنے آپ پر قابو رکھے۔",
    source: "Sahih al-Bukhari 6114",
    reference: "Sahih al-Bukhari 6114",
  },
  {
    kind: "reminder",
    text: "And remember your Lord within yourself in humility and fear, without loudness of words, in the mornings and evenings. And do not be among the heedless.",
    textUr: "اپنے رب کو اپنے دل میں عاجزی اور خوف کے ساتھ صبح و شام یاد کرو اور غافلوں میں سے نہ ہو۔",
    source: "Qur'an 7:205",
    reference: "Qur'an 7:205",
  },
  {
    kind: "reminder",
    text: "Unquestionably, by the remembrance of Allah hearts are assured.",
    textUr: "یاد رکھو، اللہ کے ذکر ہی سے دلوں کو سکون ملتا ہے۔",
    source: "Qur'an 13:28",
    reference: "Qur'an 13:28",
  },
  {
    kind: "reminder",
    text: "Allah said: I am as My servant thinks of Me, and I am with him when he remembers Me. If he remembers Me in himself, I remember him in Myself.",
    textUr: "اللہ تعالیٰ فرماتا ہے: میں اپنے بندے کے گمان کے ساتھ ہوں، اور جب وہ مجھے یاد کرتا ہے میں اس کے ساتھ ہوتا ہوں۔",
    source: "Sahih al-Bukhari 7405",
    reference: "Sahih Muslim 2675",
  },
];

export function getDailyReminder(date = new Date()): DailyReminder {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return DAILY_REMINDERS[dayIndex % DAILY_REMINDERS.length];
}