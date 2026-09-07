// Shared appointment contract and local data source for the staff appointment feature.

export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'REJECTED' | 'COMPLETED' | 'NO-SHOW';

export interface AttachmentItem {
  name: string;
  size: string;
  url?: string;
}

export interface AppointmentItem {
  id: string;
  citizenName: string;
  nicNumber: string;
  phone: string;
  email: string;
  service: string;
  dateTime: string; // "YYYY-MM-DD HH:MM AM/PM"
  assignedOfficer: string;
  status: AppointmentStatus;
  remark: string;
  documents: AttachmentItem[];
  counter?: string;
  division?: string;
  priority?: 'NORMAL' | 'URGENT' | 'VIP';
  resolutionNotes?: string;
  rejectionReason?: string;
}

export const GN_DIVISIONS = [
  'Homagama Town',
  'Homagama North',
  'Homagama South',
  'Meegoda',
  'Pitipana North',
  'Pitipana South',
  'Katuwana',
  'Godagama North',
  'Godagama South',
  'Magammana',
  'Diyagama',
  'Mattegoda',
];

export const MUNICIPAL_COUNTERS = [
  'Counter 01 - Citizen Reception & Helpdesk',
  'Counter 02 - Revenue & Assessment Taxes',
  'Counter 03 - Business & Trade Licenses',
  'Counter 04 - Planning & Building Approvals',
  'Counter 05 - Public Health & Sanitation',
  'Counter 06 - Land & Deeds Validation',
  'Executive Suite - Secretary & Chairman Office',
];

export interface AppointmentStats {
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  noShow: number;
  rescheduled: number;
  total: number;
}

// Local records keep the staff screens usable until a backend service is connected.
const MOCK_APPOINTMENTS: AppointmentItem[] = [
  {
    id: '#PS-2026-0842',
    citizenName: 'Kamal Silva',
    nicNumber: '196523456789',
    phone: '0713451689',
    email: 'kamlsilva65@gmail.com',
    service: 'Building Approval',
    dateTime: '2026-06-05 10.30 AM',
    assignedOfficer: 'M.Perera',
    status: 'PENDING',
    remark: 'Need building approval for new house construction.',
    documents: [
      { name: 'NIC Front.jpg', size: '120 KB' },
      { name: 'NIC Back.jpg', size: '110 KB' },
      { name: 'Land Document.pdf', size: '2.4 MB' },
      { name: 'Application Form.pdf', size: '1.1 MB' },
    ],
  },
  {
    id: '#PS-2026-0843',
    citizenName: 'Sampath Bandara',
    nicNumber: '198234567890',
    phone: '0775642312',
    email: 'sampath.b@outlook.com',
    service: 'Business License',
    dateTime: '2026-06-05 11.00 AM',
    assignedOfficer: 'L.D.Silva',
    status: 'APPROVED',
    remark: 'Requesting license renewal for retail grocery store in Homagama.',
    documents: [
      { name: 'NIC Front.jpg', size: '115 KB' },
      { name: 'Business Registration.pdf', size: '1.8 MB' },
    ],
  },
  {
    id: '#PS-2026-0850',
    citizenName: 'Nimal Perera',
    nicNumber: '197045678901',
    phone: '0763456789',
    email: 'nimal.p@gmail.com',
    service: 'Death Certificate',
    dateTime: '2026-06-05 02.45 PM',
    assignedOfficer: 'N.Fernando',
    status: 'RESCHEDULED',
    remark: 'Need registration copy for legal/inheritance issues.',
    documents: [
      { name: 'Declaration Form.pdf', size: '540 KB' },
      { name: 'Hospital Report.pdf', size: '1.2 MB' },
    ],
  },
  {
    id: '#PS-2026-0855',
    citizenName: 'Lasantha Wijesiri',
    nicNumber: '198556789012',
    phone: '0763408997',
    email: 'lasantha.wije@yahoo.com',
    service: 'Land Transfer',
    dateTime: '2026-07-02 08.30 AM',
    assignedOfficer: 'M.Perera',
    status: 'REJECTED',
    remark: 'Transfer request lacks original local council clearance deed.',
    documents: [
      { name: 'Deed Copy.pdf', size: '3.1 MB' },
      { name: 'Tax Receipt.jpg', size: '90 KB' },
    ],
  },
  {
    id: '#PS-2026-0876',
    citizenName: 'Dilrukshi Pathirana',
    nicNumber: '199067890123',
    phone: '0705308777',
    email: 'dilrukshi.p@gmail.com',
    service: 'Birth Certificate',
    dateTime: '2026-07-16 09.55 AM',
    assignedOfficer: 'N.Fernando',
    status: 'PENDING',
    remark: 'Applying for certified copy of birth certificate for passport requirements.',
    documents: [
      { name: 'NIC Front.jpg', size: '130 KB' },
      { name: 'Request Letter.pdf', size: '210 KB' },
    ],
  },
  {
    id: '#PS-2026-0860',
    citizenName: 'S.Pathum',
    nicNumber: '199578901234',
    phone: '0754326768',
    email: 'pathum.s@gmail.com',
    service: 'Trade License',
    dateTime: '2026-07-16 03.48 PM',
    assignedOfficer: 'S.Jayasooriya',
    status: 'COMPLETED',
    remark: 'New trade license registration for salon business.',
    documents: [
      { name: 'NIC Front.jpg', size: '125 KB' },
      { name: 'PHD Inspection Report.pdf', size: '980 KB' },
    ],
  },
  {
    id: '#PS-2026-0834',
    citizenName: 'Wasana Bandara',
    nicNumber: '198889012345',
    phone: '0758326700',
    email: 'wasana.b@gmail.com',
    service: 'Garbage Collection',
    dateTime: '2026-08-13 12.36 PM',
    assignedOfficer: 'S.Jayasooriya',
    status: 'NO-SHOW',
    remark: 'Compost bin request and special waste pickup scheduling.',
    documents: [
      { name: 'Application.pdf', size: '400 KB' },
    ],
  },
  // Assigned to Dev Admin (2 PENDING, 4 APPROVED, 2 COMPLETED, 1 REJECTED, 1 RESCHEDULED)
  {
    id: '#PS-2026-0901',
    citizenName: 'Anura Kumara',
    nicNumber: '197590123456',
    phone: '0714445555',
    email: 'anura.k@gmail.com',
    service: 'Building Approval',
    dateTime: '2026-06-01 10.30 AM',
    assignedOfficer: 'Dev Admin',
    status: 'PENDING',
    remark: 'Need building approval for new house construction.',
    documents: [
      { name: 'NIC Front.jpg', size: '120 KB' },
      { name: 'NIC Back.jpg', size: '110 KB' },
      { name: 'Land Document.pdf', size: '2.4 MB' },
      { name: 'Application Form.pdf', size: '1.1 MB' },
    ],
  },
  {
    id: '#PS-2026-0902',
    citizenName: 'Sunil Perera',
    nicNumber: '196812345678',
    phone: '0772223333',
    email: 'sunil.p@yahoo.com',
    service: 'Business License',
    dateTime: '2026-06-08 09.00 AM',
    assignedOfficer: 'Dev Admin',
    status: 'PENDING',
    remark: 'Requesting permission for wood workshop setup.',
    documents: [
      { name: 'NIC Front.jpg', size: '105 KB' },
      { name: 'Environmental Report.pdf', size: '1.5 MB' },
    ],
  },
  {
    id: '#PS-2026-0903',
    citizenName: 'Kanthi Gunawardena',
    nicNumber: '197323456789',
    phone: '0718889999',
    email: 'kanthi.g@gmail.com',
    service: 'Birth Certificate',
    dateTime: '2026-06-12 11.30 AM',
    assignedOfficer: 'Dev Admin',
    status: 'APPROVED',
    remark: 'Correction of mother name in birth registry.',
    documents: [
      { name: 'Affidavit.pdf', size: '620 KB' },
    ],
  },
  {
    id: '#PS-2026-0904',
    citizenName: 'Maithri Karunaratne',
    nicNumber: '198134567890',
    phone: '0771112222',
    email: 'maithri.k@gmail.com',
    service: 'Land Transfer',
    dateTime: '2026-06-15 02.00 PM',
    assignedOfficer: 'Dev Admin',
    status: 'APPROVED',
    remark: 'Gift deed registration to children.',
    documents: [
      { name: 'Deed.pdf', size: '2.9 MB' },
    ],
  },
  {
    id: '#PS-2026-0905',
    citizenName: 'Ranjan Ramanayake',
    nicNumber: '196245678901',
    phone: '0703334444',
    email: 'ranjan.r@gmail.com',
    service: 'Trade License',
    dateTime: '2026-06-18 10.00 AM',
    assignedOfficer: 'Dev Admin',
    status: 'APPROVED',
    remark: 'License for wholesale vehicle spare parts shop.',
    documents: [
      { name: 'NIC Front.jpg', size: '140 KB' },
    ],
  },
  {
    id: '#PS-2026-0906',
    citizenName: 'Sajith Premadasa',
    nicNumber: '197956789012',
    phone: '0765556666',
    email: 'sajith.p@outlook.com',
    service: 'Garbage Collection',
    dateTime: '2026-06-20 03.15 PM',
    assignedOfficer: 'Dev Admin',
    status: 'APPROVED',
    remark: 'Regular trash route scheduling query for residential complex.',
    documents: [
      { name: 'Request Letter.pdf', size: '300 KB' },
    ],
  },
  {
    id: '#PS-2026-0907',
    citizenName: 'Dinesh Gunawardena',
    nicNumber: '195567890123',
    phone: '0716667777',
    email: 'dinesh.g@gmail.com',
    service: 'Death Certificate',
    dateTime: '2026-06-22 09.30 AM',
    assignedOfficer: 'Dev Admin',
    status: 'COMPLETED',
    remark: 'Registration of late grandfather.',
    documents: [
      { name: 'Hospital Cert.pdf', size: '980 KB' },
    ],
  },
  {
    id: '#PS-2026-0908',
    citizenName: 'Mahinda Rajapaksa',
    nicNumber: '194578901234',
    phone: '0778889999',
    email: 'mahinda.r@gmail.com',
    service: 'Building Approval',
    dateTime: '2026-06-24 11.00 AM',
    assignedOfficer: 'Dev Admin',
    status: 'COMPLETED',
    remark: 'Renovation permission for commercial building.',
    documents: [
      { name: 'Plan.pdf', size: '5.2 MB' },
    ],
  },
  {
    id: '#PS-2026-0909',
    citizenName: 'Gotabaya Rajapaksa',
    nicNumber: '194989012345',
    phone: '0719990000',
    email: 'gotabaya.r@gmail.com',
    service: 'Land Transfer',
    dateTime: '2026-06-28 01.30 PM',
    assignedOfficer: 'Dev Admin',
    status: 'REJECTED',
    remark: 'Deed registration lacks required local environmental clearance certificate.',
    documents: [
      { name: 'Deed.pdf', size: '1.9 MB' },
    ],
  },
  {
    id: '#PS-2026-0910',
    citizenName: 'Ranil Wickremesinghe',
    nicNumber: '194990123456',
    phone: '0770001111',
    email: 'ranil.w@parliament.lk',
    service: 'Business License',
    dateTime: '2026-06-30 02.45 PM',
    assignedOfficer: 'Dev Admin',
    status: 'RESCHEDULED',
    remark: 'License for solar farm installation project.',
    documents: [
      { name: 'Proposal.pdf', size: '3.4 MB' },
    ],
  },
  // Assigned to Staff Member (2 PENDING, 3 APPROVED, 2 COMPLETED, 1 NO-SHOW)
  {
    id: '#PS-2026-0921',
    citizenName: 'Roshan Mahanama',
    nicNumber: '196711122233',
    phone: '0773334444',
    email: 'roshan.m@cricket.lk',
    service: 'Trade License',
    dateTime: '2026-07-01 10.00 AM',
    assignedOfficer: 'Staff Member',
    status: 'PENDING',
    remark: 'Application for sports academy license.',
    documents: [
      { name: 'NIC Front.jpg', size: '112 KB' },
    ],
  },
  {
    id: '#PS-2026-0922',
    citizenName: 'Sanath Jayasuriya',
    nicNumber: '196922233344',
    phone: '0714443333',
    email: 'sanath.j@gmail.com',
    service: 'Building Approval',
    dateTime: '2026-07-02 02.15 PM',
    assignedOfficer: 'Staff Member',
    status: 'PENDING',
    remark: 'Residential construction height clearance query.',
    documents: [
      { name: 'Blueprint.pdf', size: '4.1 MB' },
    ],
  },
  {
    id: '#PS-2026-0923',
    citizenName: 'Kumar Sangakkara',
    nicNumber: '197733344455',
    phone: '0775556666',
    email: 'kumar.s@foundation.lk',
    service: 'Garbage Collection',
    dateTime: '2026-07-03 09.00 AM',
    assignedOfficer: 'Staff Member',
    status: 'APPROVED',
    remark: 'Waste management project proposal meeting.',
    documents: [
      { name: 'Proposal.pdf', size: '1.2 MB' },
    ],
  },
  {
    id: '#PS-2026-0924',
    citizenName: 'Mahela Jayawardene',
    nicNumber: '197744455566',
    phone: '0716668888',
    email: 'mahela.j@gmail.com',
    service: 'Business License',
    dateTime: '2026-07-05 11.30 AM',
    assignedOfficer: 'Staff Member',
    status: 'APPROVED',
    remark: 'Restaurant chain branch registration.',
    documents: [
      { name: 'BR.pdf', size: '2.2 MB' },
    ],
  },
  {
    id: '#PS-2026-0925',
    citizenName: 'Lasith Malinga',
    nicNumber: '198355566677',
    phone: '0761113333',
    email: 'lasith.m@gmail.com',
    service: 'Land Transfer',
    dateTime: '2026-07-08 03.30 PM',
    assignedOfficer: 'Staff Member',
    status: 'APPROVED',
    remark: 'Property boundary survey validation.',
    documents: [
      { name: 'SurveyPlan.pdf', size: '3.0 MB' },
    ],
  },
  {
    id: '#PS-2026-0926',
    citizenName: 'Angelo Mathews',
    nicNumber: '198766677788',
    phone: '0772224444',
    email: 'angelo.m@yahoo.com',
    service: 'Birth Certificate',
    dateTime: '2026-07-10 10.30 AM',
    assignedOfficer: 'Staff Member',
    status: 'COMPLETED',
    remark: 'Certified birth certificate registration.',
    documents: [
      { name: 'Application.pdf', size: '250 KB' },
    ],
  },
  {
    id: '#PS-2026-0927',
    citizenName: 'Muttiah Muralitharan',
    nicNumber: '197277788899',
    phone: '0713335555',
    email: 'muralitharan.m@canned.lk',
    service: 'Trade License',
    dateTime: '2026-07-12 11.00 AM',
    assignedOfficer: 'Staff Member',
    status: 'COMPLETED',
    remark: 'Manufacturing unit license extension.',
    documents: [
      { name: 'IndustrialPermit.pdf', size: '1.7 MB' },
    ],
  },
  {
    id: '#PS-2026-0928',
    citizenName: 'Chaminda Vaas',
    nicNumber: '197488899900',
    phone: '0774446666',
    email: 'chaminda.v@outlook.com',
    service: 'Death Certificate',
    dateTime: '2026-07-14 02.00 PM',
    assignedOfficer: 'Staff Member',
    status: 'NO-SHOW',
    remark: 'Death registration of family relative.',
    documents: [
      { name: 'DeedOfInheritance.pdf', size: '890 KB' },
    ],
  },
];

// Fillers to reach 63 records in total.
// 63 total, currently we have 7 + 10 (Dev Admin) + 8 (Staff Member) = 25 records.
// Need 38 more records.
// Distribution to get precisely 63 items:
// Current Pending: 6. Needs 6 more.
// Current Approved: 8. Needs 20 more.
// Current Rejected: 2. Needs 1 more.
// Current Rescheduled: 2. Needs 8 more.
// Current No-show: 2. Needs 0 more.
// Current Completed: 5. Needs 3 more.

const servicesList = [
  'Building Approval',
  'Business License',
  'Death Certificate',
  'Land Transfer',
  'Birth Certificate',
  'Trade License',
  'Garbage Collection',
];
const officersList = ['M.Perera', 'L.D.Silva', 'N.Fernando', 'S.Jayasooriya'];

const namesList = [
  'Wasantha Kumara', 'Priyanka Fernando', 'Chandrika Siriwardene', 'Ranasinghe Premadasa',
  'Karu Jayasuriya', 'Nimal Siripala', 'Susil Premajayantha', 'Bandula Gunawardena',
  'Douglas Devananda', 'Rauff Hakeem', 'John Amaratunga', 'Gamini Lokuge',
  'Mahinda Amaraweera', 'Johnston Fernando', 'Keheliya Rambukwella', 'Wimal Weerawansa',
  'Udaya Gammanpila', 'Vasudeva Nanayakkara', 'Prasanna Ranatunga', 'C.B. Rathnayake',
  'Janaka Bandara', 'Pavithra Wanniarachchi', 'Dullas Alahapperuma', 'Bandula Harischandra',
  'Sajith Premadasa', 'Harsha de Silva', 'Eran Wickramaratne', 'Kabir Hashim',
  'Ruwan Wijewardene', 'Navin Dissanayake', 'Akila Viraj', 'Ravi Karunanayake',
  'Patali Champika', 'Sarath Fonseka', 'Mano Ganesan', 'P. Digambaran',
  'Rishad Bathiudeen', 'Lakshman Kiriella', 'M.A. Sumanthiran', 'R. Sampanthan',
];

const pendingNeeded = 6;
const approvedNeeded = 20;
const rejectedNeeded = 1;
const rescheduledNeeded = 8;
const completedNeeded = 3;

let mockIndex = 0;

const addRecords = (status: AppointmentStatus, count: number) => {
  for (let i = 0; i < count; i++) {
    const idNum = 930 + mockIndex;
    const lastNameSuffix = ['Perera', 'Silva', 'Fernando'][mockIndex % 3];
    const name = namesList[mockIndex % namesList.length] + ' ' + lastNameSuffix;
    const service = servicesList[mockIndex % servicesList.length];
    const officer = officersList[mockIndex % officersList.length];
    const day = (10 + (mockIndex % 20)).toString().padStart(2, '0');
    const hour = (1 + (mockIndex % 12)).toString().padStart(2, '0');
    const minute = (mockIndex % 2 === 0) ? '00' : '30';
    const ampm = (mockIndex % 3 === 0) ? 'PM' : 'AM';
    const nic = '198' + (mockIndex % 10) + '2345678' + (mockIndex % 10);
    const phone = '07' + (mockIndex % 9) + '1234567';
    
    MOCK_APPOINTMENTS.push({
      id: `#PS-2026-0${idNum}`,
      citizenName: name,
      nicNumber: nic,
      phone: phone,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      service: service,
      dateTime: `2026-07-${day} ${hour}.${minute} ${ampm}`,
      assignedOfficer: officer,
      status: status,
      remark: `Query regarding ${service.toLowerCase()} services and documents.`,
      documents: [
        { name: 'NIC Front.jpg', size: '120 KB' },
        { name: 'Application Form.pdf', size: '890 KB' },
      ],
    });
    mockIndex++;
  }
};

addRecords('PENDING', pendingNeeded);
addRecords('APPROVED', approvedNeeded);
addRecords('REJECTED', rejectedNeeded);
addRecords('RESCHEDULED', rescheduledNeeded);
addRecords('COMPLETED', completedNeeded);

export const getAppointments = (): AppointmentItem[] => {
  return [...MOCK_APPOINTMENTS];
};

export const fetchAppointments = async (): Promise<AppointmentItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getAppointments());
    }, 500);
  });
};

