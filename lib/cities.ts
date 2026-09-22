export const PAKISTAN_CITIES = [
  { id: "islamabad", nameEn: "Islamabad", nameUr: "اسلام آباد", lat: 33.6844, lng: 73.0479 },
  { id: "rawalpindi", nameEn: "Rawalpindi", nameUr: "راولپنڈی", lat: 33.5651, lng: 73.0169 },
  { id: "lahore", nameEn: "Lahore", nameUr: "لاہور", lat: 31.5204, lng: 74.3587 },
  { id: "karachi", nameEn: "Karachi", nameUr: "کراچی", lat: 24.8607, lng: 67.0011 },
  { id: "peshawar", nameEn: "Peshawar", nameUr: "پشاور", lat: 34.0151, lng: 71.5249 },
  { id: "quetta", nameEn: "Quetta", nameUr: "کوئٹہ", lat: 30.1798, lng: 66.9750 },
  { id: "multan", nameEn: "Multan", nameUr: "ملتان", lat: 30.1575, lng: 71.5249 },
  { id: "faisalabad", nameEn: "Faisalabad", nameUr: "فیصل آباد", lat: 31.4504, lng: 73.1350 },
  { id: "swat", nameEn: "Swat", nameUr: "سوات", lat: 35.2220, lng: 72.4258 },
  { id: "dir", nameEn: "Dir", nameUr: "دیر", lat: 35.1976, lng: 71.8742 },
  { id: "timergara", nameEn: "Timergara", nameUr: "تیمیر گره", lat: 34.8283, lng: 71.8407 },
  { id: "chakdara", nameEn: "Chakdara", nameUr: "چکدرہ", lat: 34.6423, lng: 72.0301 },
  { id: "abbottabad", nameEn: "Abbottabad", nameUr: "ایبٹ آباد", lat: 34.1688, lng: 73.2215 },
  { id: "sialkot", nameEn: "Sialkot", nameUr: "سیالکوٹ", lat: 32.4945, lng: 74.5229 },
  { id: "gujranwala", nameEn: "Gujranwala", nameUr: "گوجرانوالہ", lat: 32.1617, lng: 74.1883 },
  { id: "hyderabad", nameEn: "Hyderabad", nameUr: "حیدرآباد", lat: 25.3960, lng: 68.3578 },
  { id: "sukkur", nameEn: "Sukkur", nameUr: "سکھر", lat: 27.7136, lng: 68.8369 },
  { id: "gilgit", nameEn: "Gilgit", nameUr: "گلگت", lat: 35.8819, lng: 74.4643 },
  { id: "hunza", nameEn: "Hunza", nameUr: "ہنزہ", lat: 36.3204, lng: 74.6225 },
  { id: "skardu", nameEn: "Skardu", nameUr: "سکردو", lat: 35.2906, lng: 75.6321 },
];

export function getCity(id?: string) {
  if (!id) return PAKISTAN_CITIES.find((c) => c.id === "karachi") || PAKISTAN_CITIES[3];
  return PAKISTAN_CITIES.find((c) => c.id === id) || PAKISTAN_CITIES.find((c) => c.id === "karachi") || PAKISTAN_CITIES[3];
}