export interface AdhkarItem {
  id: string;
  arabic: string;
  target: number;
  reference: string;
  tag: string;
}

export interface AdhkarPart {
  key: "morning" | "evening";
  items: AdhkarItem[];
}

const KURSI =
  "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ";

const IKHLAS =
  "قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ";
const FALAQ =
  "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِنْ شَرِّ مَا خَلَقَ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ";
const NAS =
  "قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَهِ النَّاسِ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ مِنَ الْجِنَّةِ وَالنَّاسِ";

export const ADHKAR: AdhkarPart[] = [
  {
    key: "morning",
    items: [
      { id: "k", arabic: KURSI, target: 1, reference: "Qur'an 2:255", tag: "ayat-al-kursi" },
      { id: "ik", arabic: IKHLAS, target: 3, reference: "Sunan Abi Dawud 5082", tag: "surah" },
      { id: "f", arabic: FALAQ, target: 3, reference: "Sunan Abi Dawud 5082", tag: "surah" },
      { id: "n", arabic: NAS, target: 3, reference: "Sunan Abi Dawud 5082", tag: "surah" },
      { id: "am", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", target: 1, reference: "Sahih Muslim 2723", tag: "dua" },
      { id: "bk", arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", target: 1, reference: "At-Tirmidhi 3391", tag: "dua" },
      { id: "radith", arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", target: 3, reference: "Sunan Abi Dawud 5072", tag: "dua" },
      { id: "kaf", arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", target: 3, reference: "Sunan Abi Dawud 5088, At-Tirmidhi 3388", tag: "protection" },
      { id: "sayyid", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", target: 1, reference: "Sahih al-Bukhari 6306", tag: "istighfar" },
      { id: "la", arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", target: 10, reference: "Sahih al-Bukhari 6407", tag: "tawheed" },
      { id: "sb", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 100, reference: "Sahih al-Bukhari 6405", tag: "tasbih" },
      { id: "sh", arabic: "سُبْحَانَ اللَّهِ", target: 33, reference: "Sahih Muslim 597", tag: "tasbih" },
      { id: "hd", arabic: "الْحَمْدُ لِلَّهِ", target: 33, reference: "Sahih Muslim 597", tag: "tasbih" },
      { id: "ak", arabic: "اللَّهُ أَكْبَرُ", target: 34, reference: "Sahih Muslim 597", tag: "tasbih" },
    ],
  },
  {
    key: "evening",
    items: [
      { id: "k", arabic: KURSI, target: 1, reference: "Qur'an 2:255", tag: "ayat-al-kursi" },
      { id: "ik", arabic: IKHLAS, target: 3, reference: "Sunan Abi Dawud 5082", tag: "surah" },
      { id: "f", arabic: FALAQ, target: 3, reference: "Sunan Abi Dawud 5082", tag: "surah" },
      { id: "n", arabic: NAS, target: 3, reference: "Sunan Abi Dawud 5082", tag: "surah" },
      { id: "am", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", target: 1, reference: "Sahih Muslim 2723", tag: "dua" },
      { id: "bk", arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ", target: 1, reference: "At-Tirmidhi 3391", tag: "dua" },
      { id: "radith", arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", target: 3, reference: "Sunan Abi Dawud 5072", tag: "dua" },
      { id: "kaf", arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", target: 3, reference: "Sunan Abi Dawud 5088, At-Tirmidhi 3388", tag: "protection" },
      { id: "auzu", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", target: 3, reference: "Sahih Muslim 2708", tag: "protection" },
      { id: "sayyid", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", target: 1, reference: "Sahih al-Bukhari 6306", tag: "istighfar" },
      { id: "la", arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", target: 10, reference: "Sahih al-Bukhari 6407", tag: "tawheed" },
      { id: "sb", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 100, reference: "Sahih al-Bukhari 6405", tag: "tasbih" },
      { id: "sh", arabic: "سُبْحَانَ اللَّهِ", target: 33, reference: "Sahih Muslim 597", tag: "tasbih" },
      { id: "hd", arabic: "الْحَمْدُ لِلَّهِ", target: 33, reference: "Sahih Muslim 597", tag: "tasbih" },
      { id: "ak", arabic: "اللَّهُ أَكْبَرُ", target: 34, reference: "Sahih Muslim 597", tag: "tasbih" },
    ],
  },
];

export function getAdhkarPart(key: "morning" | "evening"): AdhkarPart {
  return ADHKAR.find((p) => p.key === key) || ADHKAR[0];
}