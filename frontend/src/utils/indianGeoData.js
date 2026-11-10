// ==============================================================================
// Indian Geographic Data, States, Districts & Address Validation Utilities
// Comprehensive dataset covering all 28 Indian States & 8 Union Territories
// ==============================================================================

export const INDIAN_STATES_AND_UT = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const INDIAN_DISTRICTS_BY_STATE = {
  'Andhra Pradesh': [
    'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla',
    'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur',
    'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'NTR (Vijayawada)', 'Palnadu',
    'Parvathipuram Manyam', 'Prakasam', 'Srikakulam', 'Sri Potti Sriramulu Nellore',
    'Sri Sathya Sai', 'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'
  ],
  'Arunachal Pradesh': [
    'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Kamle',
    'Kra Daadi', 'Kurung Kumey', 'Lepa Rada', 'Lohit', 'Longding', 'Lower Dibang Valley',
    'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke Kessang', 'Papum Pare', 'Shi Yomi',
    'Siang', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'
  ],
  'Assam': [
    'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang',
    'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat',
    'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan (Guwahati)', 'Karbi Anglong',
    'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari',
    'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
  ],
  'Bihar': [
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur',
    'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad',
    'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani',
    'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas',
    'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan',
    'Supaul', 'Vaishali', 'West Champaran'
  ],
  'Chhattisgarh': [
    'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur',
    'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa',
    'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund',
    'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki', 'Mungeli', 'Narayanpur',
    'Raigarh', 'Raipur', 'Rajnandgaon', 'Sakti', 'Sarangarh-Bilaigarh', 'Sukma', 'Surajpur', 'Surguja'
  ],
  'Goa': [
    'North Goa (Panaji)', 'South Goa (Margao)'
  ],
  'Gujarat': [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar',
    'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhumi Dwarka', 'Gandhinagar',
    'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana',
    'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot',
    'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'
  ],
  'Haryana': [
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram',
    'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh',
    'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'
  ],
  'Himachal Pradesh': [
    'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti',
    'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'
  ],
  'Jharkhand': [
    'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum (Jamshedpur)',
    'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma',
    'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj',
    'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
  ],
  'Karnataka': [
    'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar',
    'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada (Mangaluru)',
    'Davanagere', 'Dharwad (Hubballi)', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi',
    'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara',
    'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir'
  ],
  'Kerala': [
    'Alappuzha', 'Ernakulam (Kochi)', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam',
    'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram',
    'Thrissur', 'Wayanad'
  ],
  'Madhya Pradesh': [
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul',
    'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas',
    'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad (Narmadapuram)', 'Indore',
    'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena',
    'Narsinghpur', 'Neemuch', 'Niwari', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa',
    'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri',
    'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
  ],
  'Maharashtra': [
    'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Beed',
    'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
    'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur',
    'Nanded', 'Nandurbar', 'Nashik', 'Dharashiv (Osmanabad)', 'Palghar', 'Parbhani',
    'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur',
    'Thane', 'Wardha', 'Washim', 'Yavatmal'
  ],
  'Manipur': [
    'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam',
    'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong',
    'Tengnoupal', 'Thoubal', 'Ukhrul'
  ],
  'Meghalaya': [
    'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills (Shillong)', 'Eastern West Khasi Hills',
    'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills',
    'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'
  ],
  'Mizoram': [
    'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai',
    'Lunglei', 'Mamit', 'Saitual', 'Serchhip', 'Siaha'
  ],
  'Nagaland': [
    'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung',
    'Mon', 'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyu', 'Tuensang',
    'Wokha', 'Zunheboto'
  ],
  'Odisha': [
    'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack',
    'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda',
    'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha (Bhubaneswar)', 'Koraput',
    'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada',
    'Sambalpur', 'Subarnapur', 'Sundargarh'
  ],
  'Punjab': [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka',
    'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana',
    'Malerkotla', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar',
    'Sahibzada Ajit Singh Nagar (Mohali)', 'Sangrur', 'Shaheed Bhagat Singh Nagar', 'Tarn Taran'
  ],
  'Rajasthan': [
    'Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara',
    'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur',
    'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu',
    'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand',
    'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'
  ],
  'Sikkim': [
    'Gangtok', 'Gyalshing', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'
  ],
  'Tamil Nadu': [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
    'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
    'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
    'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
    'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
    'Viluppuram', 'Virudhunagar'
  ],
  'Telangana': [
    'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial',
    'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar',
    'Khammam', 'Kumuram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial',
    'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet',
    'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy',
    'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
  ],
  'Tripura': [
    'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura',
    'Unakoti', 'West Tripura (Agartala)'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya',
    'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki',
    'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli',
    'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad',
    'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur',
    'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj',
    'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri', 'Kushinagar',
    'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau',
    'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
    'Prayagraj (Allahabad)', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar',
    'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra',
    'Sultanpur', 'Unnao', 'Varanasi'
  ],
  'Uttarakhand': [
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar',
    'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal',
    'Udham Singh Nagar', 'Uttarkashi'
  ],
  'West Bengal': [
    'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling',
    'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda',
    'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur',
    'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
  ],
  'Andaman and Nicobar Islands': [
    'Nicobar', 'North and Middle Andaman', 'South Andaman (Port Blair)'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Dadra and Nagar Haveli', 'Daman', 'Diu'
  ],
  'Delhi (NCT)': [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
  ],
  'Jammu and Kashmir': [
    'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu',
    'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri',
    'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'
  ],
  'Ladakh': [
    'Kargil', 'Leh'
  ],
  'Lakshadweep': [
    'Lakshadweep (Kavaratti)'
  ],
  'Puducherry': [
    'Karaikal', 'Mahe', 'Puducherry', 'Yanam'
  ]
};

// Approximate geographic center coordinates for each state/UT (for smooth map navigation)
export const STATE_CENTER_COORDINATES = {
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400, zoom: 7 },
  'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278, zoom: 7 },
  'Assam': { lat: 26.2006, lng: 92.9376, zoom: 7 },
  'Bihar': { lat: 25.0961, lng: 85.3131, zoom: 7 },
  'Chhattisgarh': { lat: 21.2787, lng: 81.8661, zoom: 7 },
  'Goa': { lat: 15.2993, lng: 74.1240, zoom: 10 },
  'Gujarat': { lat: 22.2587, lng: 71.1924, zoom: 7 },
  'Haryana': { lat: 29.0588, lng: 76.0856, zoom: 7 },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1734, zoom: 7 },
  'Jharkhand': { lat: 23.6102, lng: 85.2799, zoom: 7 },
  'Karnataka': { lat: 15.3173, lng: 75.7139, zoom: 7 },
  'Kerala': { lat: 10.8505, lng: 76.2711, zoom: 7 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569, zoom: 6 },
  'Maharashtra': { lat: 19.7515, lng: 75.7139, zoom: 7 },
  'Manipur': { lat: 24.6637, lng: 93.9063, zoom: 8 },
  'Meghalaya': { lat: 25.4670, lng: 91.3662, zoom: 8 },
  'Mizoram': { lat: 23.1645, lng: 92.9376, zoom: 8 },
  'Nagaland': { lat: 26.1584, lng: 94.5624, zoom: 8 },
  'Odisha': { lat: 20.9517, lng: 85.0985, zoom: 7 },
  'Punjab': { lat: 31.1471, lng: 75.3412, zoom: 7 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179, zoom: 6 },
  'Sikkim': { lat: 27.5330, lng: 88.5122, zoom: 9 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569, zoom: 7 },
  'Telangana': { lat: 18.1124, lng: 79.0193, zoom: 7 },
  'Tripura': { lat: 23.9408, lng: 91.9882, zoom: 8 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, zoom: 6 },
  'Uttarakhand': { lat: 30.0668, lng: 79.0193, zoom: 7 },
  'West Bengal': { lat: 22.9868, lng: 87.8550, zoom: 7 },
  'Delhi (NCT)': { lat: 28.6139, lng: 77.2090, zoom: 11 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794, zoom: 12 },
  'Puducherry': { lat: 11.9416, lng: 79.8083, zoom: 12 },
  'Jammu and Kashmir': { lat: 33.7782, lng: 76.5762, zoom: 7 },
  'Ladakh': { lat: 34.1526, lng: 77.5771, zoom: 7 },
};

export const INDIA_MAP_DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629, zoom: 5 };

/**
 * Validates Indian 10-digit mobile number (+91 prefix optional, starts with 6-9)
 * @param {string} phone
 * @returns {boolean}
 */
export function validateIndianMobile(phone) {
  if (!phone) return false;
  const clean = phone.replace(/[\s-]/g, '');
  // Matches +919876543210, 919876543210, 09876543210, or 9876543210
  return /^(?:(?:\+91|91|0)?[6-9]\d{9})$/.test(clean);
}

/**
 * Standardizes mobile number to clean 10-digit format
 * @param {string} phone
 * @returns {string}
 */
export function cleanIndianMobile(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length > 10 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length > 10 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(-10);
}

/**
 * Validates 6-digit Indian Postal PIN Code (100000 - 999999)
 * @param {string|number} pin
 * @returns {boolean}
 */
export function validateIndianPinCode(pin) {
  if (!pin) return false;
  const str = String(pin).trim();
  return /^[1-9][0-9]{5}$/.test(str);
}

/**
 * Formats structured Indian address into a clean single-line string
 */
export function formatFullIndianAddress({
  houseNumber = '',
  street = '',
  landmark = '',
  city = '',
  district = '',
  state = '',
  pincode = '',
  country = 'India',
}) {
  const parts = [];
  if (houseNumber) parts.push(houseNumber.trim());
  if (street) parts.push(street.trim());
  if (landmark) parts.push(`Near ${landmark.trim()}`);
  if (city) parts.push(city.trim());
  if (district && district !== city) parts.push(`Dist. ${district.trim()}`);
  if (state) parts.push(state.trim());
  if (pincode) parts.push(`PIN: ${pincode.trim()}`);
  if (country) parts.push(country.trim());

  return parts.join(', ');
}

// Comprehensive Pan-India location coordinates for offline fallback & search auto-completion
export const PAN_INDIA_LOCATIONS = [
  // Telangana
  { name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867, type: 'Metro City', pincode: '500001' },
  { name: 'Warangal', state: 'Telangana', district: 'Warangal', lat: 17.9689, lng: 79.5941, type: 'City', pincode: '506002' },
  { name: 'Karimnagar', state: 'Telangana', district: 'Karimnagar', lat: 18.4386, lng: 79.1288, type: 'City', pincode: '505001' },
  { name: 'Nizamabad', state: 'Telangana', district: 'Nizamabad', lat: 18.6725, lng: 78.0941, type: 'City', pincode: '503001' },
  { name: 'Khammam', state: 'Telangana', district: 'Khammam', lat: 17.2473, lng: 80.1514, type: 'City', pincode: '507001' },
  { name: 'Ramagundam', state: 'Telangana', district: 'Peddapalli', lat: 18.7618, lng: 79.4744, type: 'City', pincode: '505208' },
  { name: 'Siddipet', state: 'Telangana', district: 'Siddipet', lat: 18.1018, lng: 78.8520, type: 'Town', pincode: '502103' },
  { name: 'Nalgonda', state: 'Telangana', district: 'Nalgonda', lat: 17.0577, lng: 79.2684, type: 'City', pincode: '508001' },
  { name: 'Mahabubnagar', state: 'Telangana', district: 'Mahabubnagar', lat: 16.7488, lng: 77.9856, type: 'City', pincode: '509001' },
  // Andhra Pradesh
  { name: 'Vijayawada', state: 'Andhra Pradesh', district: 'NTR (Vijayawada)', lat: 16.5062, lng: 80.6480, type: 'Major City', pincode: '520001' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, type: 'Major City', pincode: '530001' },
  { name: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur', lat: 16.3067, lng: 80.4365, type: 'City', pincode: '522002' },
  { name: 'Nellore', state: 'Andhra Pradesh', district: 'Sri Potti Sriramulu Nellore', lat: 14.4426, lng: 79.9865, type: 'City', pincode: '524001' },
  { name: 'Kurnool', state: 'Andhra Pradesh', district: 'Kurnool', lat: 15.8281, lng: 78.0373, type: 'City', pincode: '518001' },
  { name: 'Tirupati', state: 'Andhra Pradesh', district: 'Tirupati', lat: 13.6288, lng: 79.4192, type: 'City', pincode: '517501' },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', district: 'East Godavari', lat: 17.0005, lng: 81.8040, type: 'City', pincode: '533101' },
  { name: 'Kakinada', state: 'Andhra Pradesh', district: 'Kakinada', lat: 16.9891, lng: 82.2475, type: 'City', pincode: '533001' },
  { name: 'Anantapur', state: 'Andhra Pradesh', district: 'Ananthapuramu', lat: 14.6819, lng: 77.6006, type: 'City', pincode: '515001' },
  { name: 'Kadapa', state: 'Andhra Pradesh', district: 'YSR Kadapa', lat: 14.4673, lng: 78.8242, type: 'City', pincode: '516001' },
  // Karnataka
  { name: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, type: 'Metro City', pincode: '560001' },
  { name: 'Mysuru', state: 'Karnataka', district: 'Mysuru', lat: 12.2958, lng: 76.6394, type: 'City', pincode: '570001' },
  { name: 'Hubballi-Dharwad', state: 'Karnataka', district: 'Dharwad (Hubballi)', lat: 15.3647, lng: 75.1240, type: 'City', pincode: '580020' },
  { name: 'Mangaluru', state: 'Karnataka', district: 'Dakshina Kannada (Mangaluru)', lat: 12.9141, lng: 74.8560, type: 'City', pincode: '575001' },
  { name: 'Belagavi', state: 'Karnataka', district: 'Belagavi', lat: 15.8497, lng: 74.4977, type: 'City', pincode: '590001' },
  { name: 'Kalaburagi', state: 'Karnataka', district: 'Kalaburagi', lat: 17.3297, lng: 76.8343, type: 'City', pincode: '585101' },
  { name: 'Ballari', state: 'Karnataka', district: 'Ballari', lat: 15.1394, lng: 76.9214, type: 'City', pincode: '583101' },
  // Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'Metro City', pincode: '600001' },
  { name: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lng: 76.9558, type: 'Major City', pincode: '641001' },
  { name: 'Madurai', state: 'Tamil Nadu', district: 'Madurai', lat: 9.9252, lng: 78.1198, type: 'City', pincode: '625001' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, type: 'City', pincode: '620001' },
  { name: 'Salem', state: 'Tamil Nadu', district: 'Salem', lat: 11.6643, lng: 78.1460, type: 'City', pincode: '636001' },
  { name: 'Tirunelveli', state: 'Tamil Nadu', district: 'Tirunelveli', lat: 8.7139, lng: 77.7567, type: 'City', pincode: '627001' },
  { name: 'Vellore', state: 'Tamil Nadu', district: 'Vellore', lat: 12.9165, lng: 79.1325, type: 'City', pincode: '632001' },
  // Maharashtra
  { name: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', lat: 19.0760, lng: 72.8777, type: 'Metro City', pincode: '400001' },
  { name: 'Pune', state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567, type: 'Metro City', pincode: '411001' },
  { name: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882, type: 'Major City', pincode: '440001' },
  { name: 'Thane', state: 'Maharashtra', district: 'Thane', lat: 19.2183, lng: 72.9781, type: 'Major City', pincode: '400601' },
  { name: 'Nashik', state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lng: 73.7898, type: 'City', pincode: '422001' },
  { name: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar (Aurangabad)', lat: 19.8762, lng: 75.3433, type: 'City', pincode: '431001' },
  { name: 'Solapur', state: 'Maharashtra', district: 'Solapur', lat: 17.6599, lng: 75.9064, type: 'City', pincode: '413001' },
  { name: 'Kolhapur', state: 'Maharashtra', district: 'Kolhapur', lat: 16.7050, lng: 74.2433, type: 'City', pincode: '416001' },
  // Delhi
  { name: 'Delhi', state: 'Delhi (NCT)', district: 'Central Delhi', lat: 28.6139, lng: 77.2090, type: 'Capital Metro', pincode: '110001' },
  { name: 'New Delhi', state: 'Delhi (NCT)', district: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'Capital City', pincode: '110001' },
  { name: 'Connaught Place', state: 'Delhi (NCT)', district: 'New Delhi', lat: 28.6315, lng: 77.2167, type: 'Locality', pincode: '110001' },
  { name: 'Dwarka', state: 'Delhi (NCT)', district: 'South West Delhi', lat: 28.5921, lng: 77.0460, type: 'Locality', pincode: '110075' },
  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639, type: 'Metro City', pincode: '700001' },
  { name: 'Howrah', state: 'West Bengal', district: 'Howrah', lat: 22.5958, lng: 88.2636, type: 'City', pincode: '711101' },
  { name: 'Durgapur', state: 'West Bengal', district: 'Paschim Bardhaman', lat: 23.5204, lng: 87.3119, type: 'City', pincode: '713201' },
  { name: 'Asansol', state: 'West Bengal', district: 'Paschim Bardhaman', lat: 23.6739, lng: 86.9524, type: 'City', pincode: '713301' },
  { name: 'Siliguri', state: 'West Bengal', district: 'Darjeeling', lat: 26.7271, lng: 88.3953, type: 'City', pincode: '734001' },
  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873, type: 'Capital City', pincode: '302001' },
  { name: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur', lat: 26.2389, lng: 73.0243, type: 'City', pincode: '342001' },
  { name: 'Kota', state: 'Rajasthan', district: 'Kota', lat: 25.2138, lng: 75.8648, type: 'City', pincode: '324001' },
  { name: 'Bikaner', state: 'Rajasthan', district: 'Bikaner', lat: 28.0229, lng: 73.3119, type: 'City', pincode: '334001' },
  { name: 'Ajmer', state: 'Rajasthan', district: 'Ajmer', lat: 26.4499, lng: 74.6399, type: 'City', pincode: '305001' },
  { name: 'Udaipur', state: 'Rajasthan', district: 'Udaipur', lat: 24.5854, lng: 73.7125, type: 'City', pincode: '313001' },
  // Gujarat
  { name: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714, type: 'Major City', pincode: '380001' },
  { name: 'Surat', state: 'Gujarat', district: 'Surat', lat: 21.1702, lng: 72.8311, type: 'Major City', pincode: '395001' },
  { name: 'Vadodara', state: 'Gujarat', district: 'Vadodara', lat: 22.3072, lng: 73.1812, type: 'City', pincode: '390001' },
  { name: 'Rajkot', state: 'Gujarat', district: 'Rajkot', lat: 22.3039, lng: 70.8022, type: 'City', pincode: '360001' },
  { name: 'Gandhinagar', state: 'Gujarat', district: 'Gandhinagar', lat: 23.2156, lng: 72.6369, type: 'Capital City', pincode: '382010' },
  // Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'Capital City', pincode: '226001' },
  { name: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', lat: 26.4499, lng: 80.3319, type: 'Major City', pincode: '208001' },
  { name: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739, type: 'City', pincode: '221001' },
  { name: 'Agra', state: 'Uttar Pradesh', district: 'Agra', lat: 27.1767, lng: 78.0081, type: 'City', pincode: '282001' },
  { name: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar (Noida)', lat: 28.5355, lng: 77.3910, type: 'City', pincode: '201301' },
  { name: 'Prayagraj', state: 'Uttar Pradesh', district: 'Prayagraj (Allahabad)', lat: 25.4358, lng: 81.8463, type: 'City', pincode: '211001' },
  { name: 'Meerut', state: 'Uttar Pradesh', district: 'Meerut', lat: 28.9845, lng: 77.7064, type: 'City', pincode: '250001' },
  // Kerala
  { name: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, type: 'Capital City', pincode: '695001' },
  { name: 'Kochi', state: 'Kerala', district: 'Ernakulam (Kochi)', lat: 9.9312, lng: 76.2673, type: 'Major City', pincode: '682001' },
  { name: 'Kozhikode', state: 'Kerala', district: 'Kozhikode', lat: 11.2588, lng: 75.7804, type: 'City', pincode: '673001' },
  { name: 'Thrissur', state: 'Kerala', district: 'Thrissur', lat: 10.5276, lng: 76.2144, type: 'City', pincode: '680001' },
  // Madhya Pradesh
  { name: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126, type: 'Capital City', pincode: '462001' },
  { name: 'Indore', state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lng: 75.8577, type: 'Major City', pincode: '452001' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', district: 'Jabalpur', lat: 23.1815, lng: 79.9864, type: 'City', pincode: '482001' },
  { name: 'Gwalior', state: 'Madhya Pradesh', district: 'Gwalior', lat: 26.2183, lng: 78.1828, type: 'City', pincode: '474001' },
  // Bihar
  { name: 'Patna', state: 'Bihar', district: 'Patna', lat: 25.6127, lng: 85.1589, type: 'Capital City', pincode: '800001' },
  { name: 'Gaya', state: 'Bihar', district: 'Gaya', lat: 24.7955, lng: 85.0002, type: 'City', pincode: '823001' },
  { name: 'Bhagalpur', state: 'Bihar', district: 'Bhagalpur', lat: 25.2425, lng: 86.9842, type: 'City', pincode: '812001' },
  { name: 'Muzaffarpur', state: 'Bihar', district: 'Muzaffarpur', lat: 26.1209, lng: 85.3647, type: 'City', pincode: '842001' },
  // Punjab
  { name: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', lat: 30.7333, lng: 76.7794, type: 'Union Territory / Capital', pincode: '160017' },
  { name: 'Ludhiana', state: 'Punjab', district: 'Ludhiana', lat: 30.9010, lng: 75.8573, type: 'Major City', pincode: '141001' },
  { name: 'Amritsar', state: 'Punjab', district: 'Amritsar', lat: 31.6340, lng: 74.8723, type: 'City', pincode: '143001' },
  { name: 'Jalandhar', state: 'Punjab', district: 'Jalandhar', lat: 31.3260, lng: 75.5762, type: 'City', pincode: '144001' },
  // Haryana
  { name: 'Faridabad', state: 'Haryana', district: 'Faridabad', lat: 28.4089, lng: 77.3178, type: 'City', pincode: '121001' },
  { name: 'Gurugram', state: 'Haryana', district: 'Gurugram', lat: 28.4595, lng: 77.0266, type: 'Major City', pincode: '122001' },
  { name: 'Panipat', state: 'Haryana', district: 'Panipat', lat: 29.3909, lng: 76.9635, type: 'City', pincode: '132103' },
  // Odisha
  { name: 'Bhubaneswar', state: 'Odisha', district: 'Khordha (Bhubaneswar)', lat: 20.2961, lng: 85.8245, type: 'Capital City', pincode: '751001' },
  { name: 'Cuttack', state: 'Odisha', district: 'Cuttack', lat: 20.4625, lng: 85.8828, type: 'City', pincode: '753001' },
  { name: 'Rourkela', state: 'Odisha', district: 'Sundargarh', lat: 22.2604, lng: 84.8536, type: 'City', pincode: '769001' },
  { name: 'Puri', state: 'Odisha', district: 'Puri', lat: 19.8135, lng: 85.8312, type: 'Town', pincode: '752001' },
  // Assam
  { name: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan (Guwahati)', lat: 26.1445, lng: 91.7362, type: 'Major City', pincode: '781001' },
  { name: 'Silchar', state: 'Assam', district: 'Cachar', lat: 24.8333, lng: 92.7789, type: 'City', pincode: '788001' },
  { name: 'Dibrugarh', state: 'Assam', district: 'Dibrugarh', lat: 27.4728, lng: 94.9120, type: 'City', pincode: '786001' },
  // Jammu & Kashmir
  { name: 'Srinagar', state: 'Jammu and Kashmir', district: 'Srinagar', lat: 34.0837, lng: 74.7973, type: 'Summer Capital', pincode: '190001' },
  { name: 'Jammu', state: 'Jammu and Kashmir', district: 'Jammu', lat: 32.7266, lng: 74.8570, type: 'Winter Capital', pincode: '180001' },
  { name: 'Anantnag', state: 'Jammu and Kashmir', district: 'Anantnag', lat: 33.7311, lng: 75.1522, type: 'Town', pincode: '192101' },
  // Ladakh
  { name: 'Leh', state: 'Ladakh', district: 'Leh', lat: 34.1526, lng: 77.5771, type: 'Town', pincode: '194101' },
  { name: 'Kargil', state: 'Ladakh', district: 'Kargil', lat: 34.5539, lng: 76.1349, type: 'Town', pincode: '194103' },
  // Goa
  { name: 'Panaji', state: 'Goa', district: 'North Goa (Panaji)', lat: 15.4909, lng: 73.8278, type: 'Capital City', pincode: '403001' },
  { name: 'Margao', state: 'Goa', district: 'South Goa (Margao)', lat: 15.2832, lng: 73.9862, type: 'City', pincode: '403601' },
  // Chhattisgarh
  { name: 'Raipur', state: 'Chhattisgarh', district: 'Raipur', lat: 21.2514, lng: 81.6296, type: 'Capital City', pincode: '492001' },
  { name: 'Bhilai', state: 'Chhattisgarh', district: 'Durg', lat: 21.1938, lng: 81.3509, type: 'City', pincode: '490001' },
  { name: 'Bilaspur', state: 'Chhattisgarh', district: 'Bilaspur', lat: 22.0797, lng: 82.1409, type: 'City', pincode: '495001' },
  // Jharkhand
  { name: 'Ranchi', state: 'Jharkhand', district: 'Ranchi', lat: 23.3441, lng: 85.3096, type: 'Capital City', pincode: '834001' },
  { name: 'Jamshedpur', state: 'Jharkhand', district: 'East Singhbhum (Jamshedpur)', lat: 22.8046, lng: 86.2029, type: 'Major City', pincode: '831001' },
  { name: 'Dhanbad', state: 'Jharkhand', district: 'Dhanbad', lat: 23.7957, lng: 86.4304, type: 'City', pincode: '826001' },
  // Himachal Pradesh
  { name: 'Shimla', state: 'Himachal Pradesh', district: 'Shimla', lat: 31.1048, lng: 77.1734, type: 'Capital City', pincode: '171001' },
  { name: 'Dharamshala', state: 'Himachal Pradesh', district: 'Kangra', lat: 32.2190, lng: 76.3234, type: 'City', pincode: '176215' },
  // Uttarakhand
  { name: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun', lat: 30.3165, lng: 78.0322, type: 'Capital City', pincode: '248001' },
  { name: 'Haridwar', state: 'Uttarakhand', district: 'Haridwar', lat: 29.9457, lng: 78.1642, type: 'City', pincode: '249401' },
  { name: 'Rishikesh', state: 'Uttarakhand', district: 'Dehradun', lat: 30.0869, lng: 78.2676, type: 'Town', pincode: '249201' },
  // Andaman and Nicobar Islands
  { name: 'Port Blair', state: 'Andaman and Nicobar Islands', district: 'South Andaman (Port Blair)', lat: 11.6234, lng: 92.7265, type: 'Capital City', pincode: '744101' },
  // Puducherry
  { name: 'Puducherry', state: 'Puducherry', district: 'Puducherry', lat: 11.9416, lng: 79.8083, type: 'Capital Town', pincode: '605001' },
];

/**
 * Searches local Indian places and returns fast matches
 */
export function searchLocalIndianPlaces(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results = [];

  // Match popular places
  for (const place of PAN_INDIA_LOCATIONS) {
    if (
      place.name.toLowerCase().includes(q) ||
      place.state.toLowerCase().includes(q) ||
      place.district.toLowerCase().includes(q) ||
      (place.pincode && place.pincode.startsWith(q))
    ) {
      results.push({
        id: `local_${place.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: place.name,
        displayName: `${place.name}, ${place.district}, ${place.state}, India${place.pincode ? ` (${place.pincode})` : ''}`,
        latitude: place.lat,
        longitude: place.lng,
        type: place.type,
        address: {
          country: 'India',
          state: place.state,
          district: place.district,
          city: place.name,
          street: '',
          pincode: place.pincode,
          formattedAddress: `${place.name}, ${place.district}, ${place.state}, India`,
        },
      });
    }
  }

  // Match states directly if user searched state name
  for (const state of INDIAN_STATES_AND_UT) {
    if (state.toLowerCase().includes(q) && !results.some((r) => r.name === state)) {
      const center = STATE_CENTER_COORDINATES[state] || INDIA_MAP_DEFAULT_CENTER;
      results.push({
        id: `state_${state.toLowerCase().replace(/\s+/g, '_')}`,
        name: state,
        displayName: `${state}, India (State / UT)`,
        latitude: center.lat,
        longitude: center.lng,
        type: 'State / Union Territory',
        address: {
          country: 'India',
          state,
          district: (INDIAN_DISTRICTS_BY_STATE[state] || [])[0] || '',
          city: '',
          street: '',
          pincode: '',
          formattedAddress: `${state}, India`,
        },
      });
    }
  }

  return results.slice(0, 10);
}

/**
 * Finds the closest Indian city / district center to arbitrary coordinates
 */
export function findNearestIndianLocation(lat, lng) {
  let closest = PAN_INDIA_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of PAN_INDIA_LOCATIONS) {
    const dLat = loc.lat - lat;
    const dLng = loc.lng - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  return closest;
}


